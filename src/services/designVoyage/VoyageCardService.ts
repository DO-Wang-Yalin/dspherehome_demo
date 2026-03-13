const LEADS_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://dreamone.cloud/api')
  .replace(/\/$/, '') + '/dsphr/v1'

export interface VoyageCardSavePayload {
  visitor_id: string
  style_id: string
  style_name: string | null
  focus_space: string | null
  card_number: string
}

export interface VoyageCardSaveResponse {
  success: boolean
  message: string
  id: number | null
}

export async function saveVoyageCard(payload: VoyageCardSavePayload): Promise<VoyageCardSaveResponse> {
  const response = await fetch(`${LEADS_BASE}/leads/voyage-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const detail = typeof err?.detail === 'string' ? err.detail : JSON.stringify(err?.detail ?? err)
    throw new Error(detail || `Save failed: ${response.status}`)
  }
  return response.json()
}
