export interface StyleOption {
  id: string
  name: string
  color?: string
}
import {
  collectLead,
  type LeadsOptionsResponse,
  type ProjectLocation
} from '../leads'

export type LeadOptions = LeadsOptionsResponse
export type { ProjectLocation }

export const leadsApi = {
  submitLead: async (
    data: Parameters<typeof collectLead>[0],
    attachments?: File[]
  ): Promise<{ success: boolean; message: string; id?: number | null }> => {
    return collectLead(data, attachments)
  }
}

export interface DesignVoyageFormData {
  projectType: string
  projectPosition: string
  handoverStatus?: string
  area: string
  budget: string
  name: string
  salutation: string
  city: string
  phone: string
  ageGroup: string
  industry: string
}

export interface JourneySummary {
  currentFavorite: StyleOption | null
  focusSpace: string | null
}

export type LeadPayload = Parameters<typeof collectLead>[0]

export function buildDesignVoyageLeadPayload(
  data: DesignVoyageFormData,
  options?: { journeySummary?: JourneySummary; project_location?: ProjectLocation }
): LeadPayload {
  const phoneDigits = (data.phone || '').replace(/-/g, '')
  const extra: Record<string, unknown> = {}
  if (data.projectPosition) {
    extra.project_position_text = data.projectPosition
  }
  if (data.handoverStatus) {
    extra.handover_status = data.handoverStatus
  }
  if (options?.journeySummary) {
    const { currentFavorite, focusSpace } = options.journeySummary
    if (currentFavorite) {
      extra.design_style_id = currentFavorite.id
      extra.design_style_name = currentFavorite.name
      extra.design_style_color = currentFavorite.color
    }
    if (focusSpace != null && focusSpace !== '') {
      extra.focus_space = focusSpace
    }
  }
  const payload: LeadPayload = {
    user_name: data.name || '',
    user_city: data.city || '',
    user_phone: phoneDigits || data.phone || '',
    user_title: data.salutation || '',
    user_age_range: data.ageGroup || '',
    user_industry: data.industry || '',
    project_name: data.projectPosition || 'DesignVoyage-种子用户',
    project_city: data.projectPosition || '',
    project_type: data.projectType || '',
    project_area: Math.round(parseFloat(data.area) || 0),
    project_budget_range: data.budget || '',
    ...(options?.project_location != null ? { project_location: options.project_location } : {}),
    ...(Object.keys(extra).length > 0 ? { extra } : {})
  }
  return payload
}
