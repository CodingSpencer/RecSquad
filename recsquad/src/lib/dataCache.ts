type CacheEntry<T> = {
  data?: T
  updatedAt: number
  request?: Promise<T>
}

const cache = new Map<string, CacheEntry<unknown>>()
const defaultStaleTime = 60_000

export function getCachedData<T>(key: string): T | undefined {
  return cache.get(key)?.data as T | undefined
}

export function fetchCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime = defaultStaleTime,
): Promise<T> {
  let entry = cache.get(key) as CacheEntry<T> | undefined
  if (entry?.data !== undefined && Date.now() - entry.updatedAt < staleTime) {
    return Promise.resolve(entry.data)
  }
  if (entry?.request) return entry.request

  entry ??= { updatedAt: 0 }
  const request = fetcher().then((data) => {
    entry.data = data
    entry.updatedAt = Date.now()
    return data
  }).finally(() => {
    entry.request = undefined
  })
  entry.request = request
  cache.set(key, entry)
  return request
}

export function invalidateCachedData(key: string): void {
  cache.delete(key)
}

export function invalidateCachedDataPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
