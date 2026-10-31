<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

<main class="group-page">
  <a href="/groups" class="back-link">← Back to Groups</a>
  <div class="group-heading">
    <div>
      <div class="group-profile">
        {#if data.group.image_url}
          <img src={data.group.image_url} alt="" class="group-avatar" />
        {:else}
          <span class="group-avatar group-initial" aria-hidden="true">
            {data.group.name.trim().charAt(0).toUpperCase()}
          </span>
        {/if}
        <h1 class="page-title">
          {data.group.name}
          {#if data.group.city && data.group.state}
            <span class="group-location">· {data.group.city}, {data.group.state}</span>
          {/if}
        </h1>
      </div>
      {#if data.group.sport}
        <p class="group-sport">{data.group.sport}</p>
      {/if}
      {#if data.group.description}
        <p class="group-description">{data.group.description}</p>
      {/if}
    </div>
    {#if data.isAdmin}
      <a href={`/groups/${data.group.id}/events/new`} class="primary-link">
        Create Event
      </a>
    {/if}
  </div>

  <section class="members-section" aria-labelledby="members-heading">
    <div class="members-heading">
      <h2 id="members-heading" class="section-title">Members</h2>
      <span class="member-count">{data.members.length}</span>
    </div>
    {#if data.members.length === 0}
      <p class="empty-message">No members yet.</p>
    {:else}
      <ul class="member-list">
        {#each data.members as member (member.id)}
          <li class="member-item">
            {#if member.avatarUrl}
              <img src={member.avatarUrl} alt="" class="member-avatar" />
            {:else}
              <span class="member-avatar member-initial" aria-hidden="true">
                {member.name.trim().charAt(0).toUpperCase()}
              </span>
            {/if}
            <div class="member-details">
              <span class="member-name">{member.name}</span>
              {#if member.fullName && member.fullName !== member.name}
                <span class="member-full-name">{member.fullName}</span>
              {/if}
            </div>
            <span class="member-role">{member.role}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</main>

<style>
  .group-page {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #059669;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .group-heading,
  .members-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .group-heading {
    margin-bottom: 2rem;
  }

  .group-profile {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .group-avatar {
    width: 3.5rem;
    height: 3.5rem;
    flex-shrink: 0;
    border-radius: 9999px;
    background: #d1fae5;
    object-fit: cover;
  }

  .group-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #047857;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .group-sport {
    color: #71717a;
  }

  .group-location {
    color: #71717a;
    font-size: 1rem;
    font-weight: 400;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .group-description {
    margin-top: 0.5rem;
    color: #52525b;
  }

  .primary-link {
    flex-shrink: 0;
    border-radius: 0.25rem;
    background: #059669;
    padding: 0.5rem 1rem;
    color: #fff;
    font-weight: 500;
    transition: background-color 150ms;
  }

  .primary-link:hover {
    background: #047857;
  }

  .members-section {
    border-top: 1px solid #e4e4e7;
    padding-top: 1.5rem;
  }

  .members-heading {
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .member-count {
    border-radius: 9999px;
    background: #e4e4e7;
    padding: 0.125rem 0.625rem;
    font-size: 0.875rem;
    color: #3f3f46;
  }

  .empty-message {
    color: #71717a;
  }

  .member-list {
    display: flex;
    flex-direction: column;
  }

  .member-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid #e4e4e7;
    padding: 0.75rem 0;
  }

  .member-avatar {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    border-radius: 9999px;
    object-fit: cover;
  }

  .member-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #059669;
    color: #fff;
    font-weight: 600;
  }

  .member-details {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
  }

  .member-name {
    font-weight: 500;
  }

  .member-full-name {
    font-size: 0.875rem;
    color: #71717a;
  }

  .member-role {
    border-radius: 0.25rem;
    background: #f4f4f5;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    text-transform: capitalize;
    color: #52525b;
  }

  :global(.dark) .back-link {
    color: #34d399;
  }

  :global(.dark) .group-sport,
  :global(.dark) .group-location,
  :global(.dark) .member-full-name,
  :global(.dark) .empty-message {
    color: #a1a1aa;
  }

  :global(.dark) .group-description {
    color: #d4d4d8;
  }

  :global(.dark) .group-initial {
    background: #064e3b;
    color: #a7f3d0;
  }

  :global(.dark) .members-section,
  :global(.dark) .member-item {
    border-color: #3f3f46;
  }

  :global(.dark) .member-count,
  :global(.dark) .member-role {
    background: #27272a;
    color: #d4d4d8;
  }

  @media (max-width: 480px) {
    .group-heading {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
