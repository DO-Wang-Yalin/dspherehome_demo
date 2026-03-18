const PREFIX = 'dsphr:pendingResolved:v1:'
export const PENDING_RESOLVED_EVENT = 'dsphr-pending-resolved'

function storageKey(leadId: string) {
  return `${PREFIX}${leadId}`
}

export function getResolvedPendingKeys(leadId: string | null): Set<string> {
  if (!leadId) return new Set()
  try {
    const raw = localStorage.getItem(storageKey(leadId))
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function addResolvedPendingKey(leadId: string | null, itemKey: string) {
  if (!leadId || !itemKey) return
  try {
    const s = getResolvedPendingKeys(leadId)
    if (s.has(itemKey)) return
    s.add(itemKey)
    localStorage.setItem(storageKey(leadId), JSON.stringify([...s]))
    window.dispatchEvent(new Event(PENDING_RESOLVED_EVENT))
  } catch {
    /* ignore */
  }
}
