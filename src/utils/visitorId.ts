const STORAGE_KEY = 'dreamone_dv_visitor_id'

/**
 * Returns a stable visitor ID for the current browser/device.
 * Persists in localStorage; creates a new UUID on first visit.
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }
  let id = window.localStorage.getItem(STORAGE_KEY)
  if (!id || !id.trim()) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    window.localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
