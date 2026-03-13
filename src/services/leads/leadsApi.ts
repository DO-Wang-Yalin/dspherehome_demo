const LEADS_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://dreamone.cloud/api')
  .replace(/\/$/, '') + '/dsphr/v1'

export interface LeadsOptionsResponse {
  user_title: string[]
  user_age_range: string[]
  user_industry: string[]
  project_type: string[]
  project_budget_range: string[]
  space_function: string[]
}

export interface ProjectLocation {
  latitude: number
  longitude: number
}

export interface CollectLeadData {
  user_name: string
  user_city: string
  user_phone: string
  user_title: string
  user_age_range: string
  user_industry: string
  project_name: string
  project_city: string
  project_type: string
  project_area: number
  project_budget_range: string
  project_location?: ProjectLocation
  extra?: Record<string, unknown>
}

export interface CollectLeadResponse {
  success: boolean
  message: string
  id: number | null
}

export interface CollectLeadErrorBody {
  detail?: string | Record<string, unknown>
}

export async function getLeadsOptions(): Promise<LeadsOptionsResponse> {
  const response = await fetch(`${LEADS_BASE}/leads/options`)
  if (!response.ok) {
    throw new Error(`Failed to fetch leads options: ${response.statusText}`)
  }
  return response.json()
}

export async function collectLead(
  data: CollectLeadData,
  attachments?: File[]
): Promise<CollectLeadResponse> {
  const form = new FormData()
  form.append('data', JSON.stringify(data))
  if (attachments?.length) {
    attachments.forEach((file) => form.append('attachments', file))
  }

  const response = await fetch(`${LEADS_BASE}/leads`, {
    method: 'POST',
    body: form
  })

  if (!response.ok) {
    const errorBody: CollectLeadErrorBody = await response.json().catch(() => ({}))
    const detail =
      typeof errorBody?.detail === 'string'
        ? errorBody.detail
        : JSON.stringify(errorBody?.detail ?? errorBody ?? '')
    throw new Error(detail || `提交失败: ${response.status}`)
  }
  return response.json()
}
