import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Empty, ErrorMessage, Field, GroupAvatar, Loading, Page } from '../components/shared'
import { getCachedData, invalidateCachedData } from '../lib/dataCache'
import { canonicalizeState } from '../lib/location'
import { configurationMessage, loadGroups } from '../lib/pageData'
import { supabase } from '../lib/supabase'
import type { Group, Profile, User } from '../types'

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(() => getCachedData<Group[]>('groups') ?? [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(() => getCachedData<Group[]>('groups') === undefined)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await loadGroups()
        if (active) { setGroups(data); setError(''); setLoading(false) }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
          setLoading(false)
        }
      }
    }
    void load()
    return () => { active = false }
  }, [])

  return (
    <Page title="Groups" action={<Link className="button primary" to="/groups/new">Create group</Link>}>
      {error && groups.length === 0 ? <ErrorMessage>{error}</ErrorMessage> : <>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {loading ? <Loading /> : groups.length === 0 ? <Empty>No groups yet. Create one to get started.</Empty> : (
          <div className="list-stack">{groups.map((group) => <GroupCard key={group.id} group={group} />)}</div>
        )}
      </>}
    </Page>
  )
}

function GroupCard({ group }: { group: Group }) {
  return (
    <Link className="card group-card" to={`/groups/${group.id}`}>
      <GroupAvatar group={group} />
      <span className="grow">
        <strong>{group.name}</strong>
        <span className="muted small">{[group.sport, group.city, group.state].filter(Boolean).join(' · ') || 'Sports community'}</span>
        {group.description && <span className="muted small">{group.description}</span>}
      </span>
      <span className="card-arrow" aria-hidden="true">→</span>
    </Link>
  )
}

export function GroupPage({ user }: { user: User | null }) {
  const { id = '' } = useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Array<{ id: string; role: string; profile: Profile | null }>>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) {
        setError(configurationMessage)
        setLoading(false)
        return
      }
      const { data: groupData, error: groupError } = await supabase.from('groups').select('*').eq('id', id).maybeSingle()
      if (groupError) {
        if (active) { setError(`Unable to load group: ${groupError.message}`); setLoading(false) }
        return
      }
      if (!groupData) {
        if (active) { setError('Group not found.'); setLoading(false) }
        return
      }
      const groupRecord = groupData as Group
      const { data: memberData, error: memberError } = await supabase.from('group_members').select('user_id, role').eq('group_id', id)
      if (memberError) {
        if (active) { setError(`Unable to load group members: ${memberError.message}`); setLoading(false) }
        return
      }
      const membershipRows = (memberData ?? []) as Array<{ user_id: string; role: string }>
      const memberIds = [...new Set([...membershipRows.map((member) => member.user_id), ...(groupRecord.created_by ? [groupRecord.created_by] : [])])]
      let profiles: Profile[] = []
      if (memberIds.length) {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', memberIds)
        if (profileError) {
          if (active) { setError(`Unable to load member profiles: ${profileError.message}`); setLoading(false) }
          return
        }
        profiles = (profileData ?? []) as Profile[]
      }
      const currentMember = membershipRows.find((member) => member.user_id === user?.id)
      if (active) {
        setGroup(groupRecord)
        setMembers(memberIds.map((memberId) => ({
          id: memberId,
          role: memberId === groupRecord.created_by ? 'admin' : membershipRows.find((member) => member.user_id === memberId)?.role ?? 'member',
          profile: profiles.find((profile) => profile.id === memberId) ?? null,
        })))
        setIsAdmin(currentMember?.role === 'admin' || groupRecord.created_by === user?.id)
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [id, user?.id])

  if (loading) return <Page><Loading /></Page>
  if (error || !group) return <Page><ErrorMessage>{error || 'Group not found.'}</ErrorMessage><Link className="text-link" to="/groups">Back to groups</Link></Page>

  return (
    <Page>
      <Link className="back-link" to="/groups">← All groups</Link>
      <section className="card group-detail">
        <div className="group-detail-heading"><GroupAvatar group={group} large /><div className="grow">
          <h1>{group.name}</h1>
          <p className="muted">{[group.sport, group.city, group.state].filter(Boolean).join(' · ')}</p>
        </div>
          {isAdmin && <Link className="button primary" to={`/groups/${id}/events/new`}>Create event</Link>}
        </div>
        {group.description && <p className="group-description">{group.description}</p>}
      </section>
      <section className="section-block">
        <div className="section-heading"><h2>Members</h2><span className="count-pill">{members.length}</span></div>
        {members.length ? <div className="member-list">{members.map((member) => {
          const label = member.profile?.username || member.profile?.full_name || 'Member'
          return <div className="member-row" key={member.id}>
            <span className="avatar">{label.charAt(0).toUpperCase()}</span>
            <span className="grow"><strong>{label}</strong>{member.profile?.full_name && member.profile.full_name !== label && <span className="muted small">{member.profile.full_name}</span>}</span>
            <span className="muted small">{member.role}</span>
          </div>
        })}</div> : <Empty>No members yet.</Empty>}
      </section>
    </Page>
  )
}

export function CreateGroupPage({ user }: { user: User | null }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!supabase) { setError(configurationMessage); return }
    if (!user) { setError('Sign in before creating a group.'); return }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const imageValue = String(form.get('image_url') ?? '').trim()
    let imageUrl: string | null = null
    if (imageValue) {
      try {
        const parsed = new URL(imageValue)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error()
        imageUrl = parsed.toString()
      } catch {
        setError('Enter a valid HTTP or HTTPS image URL.')
        setBusy(false)
        return
      }
    }
    const { data, error: insertError } = await supabase.from('groups').insert({
      name: String(form.get('name') ?? '').trim(),
      city: String(form.get('city') ?? '').trim(),
      state: canonicalizeState(String(form.get('state') ?? '')),
      sport: String(form.get('sport') ?? '').trim() || null,
      description: String(form.get('description') ?? '').trim() || null,
      image_url: imageUrl,
      created_by: user.id,
    }).select('id').single()
    if (insertError) {
      setError(`Unable to create group: ${insertError.message}`)
      setBusy(false)
      return
    }
    invalidateCachedData('groups')
    const { error: membershipError } = await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, role: 'admin' })
    if (membershipError) {
      setError(`Group created, but admin membership could not be saved: ${membershipError.message}`)
      setBusy(false)
      return
    }
    navigate(`/groups/${data.id}`)
  }

  return <Page narrow title="Create a group"><p className="muted">Start a community for your favorite sport.</p>
    <form className="form-stack card form-card" onSubmit={(event) => void submit(event)}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!user && <p className="muted small">You need to <Link className="text-link" to="/login">sign in</Link> before creating a group.</p>}
      <Field label="Group name"><input name="name" required maxLength={100} /></Field>
      <div className="field-row"><Field label="City"><input name="city" required maxLength={100} /></Field><Field label="State"><input name="state" required maxLength={100} /></Field></div>
      <Field label="Sport"><input name="sport" placeholder="e.g. Basketball" /></Field>
      <Field label="Group image URL (optional)"><input name="image_url" type="url" placeholder="https://example.com/image.jpg" /></Field>
      <Field label="Description"><textarea name="description" rows={4} /></Field>
      <button className="button primary" disabled={busy || !user}>{busy ? 'Creating...' : 'Create group'}</button>
    </form>
    <Link className="back-link" to="/groups">← Back to groups</Link>
  </Page>
}
