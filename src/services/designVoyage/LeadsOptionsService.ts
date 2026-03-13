import { getLeadsOptions, type LeadsOptionsResponse } from '../leads'

export type { LeadsOptionsResponse }

export const leadsOptionsApi = {
  getOptions: (): Promise<LeadsOptionsResponse> => getLeadsOptions()
}
