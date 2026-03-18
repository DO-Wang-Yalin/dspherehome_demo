/**
 * 选中某条已转化线索进入项目工作台：同步全局表单 + 深度测评草稿
 */
import type { FormData } from '../../types';
import { initialFormData } from '../../types';
import { DEEP_EVAL_FORM_KEYS, getDeepEvalDraft } from './deepEvalByLeadStorage';
import { getLeadById } from './savedLeadsStorage';

export function enterProjectWorkbenchFromLead(
  leadId: string,
  updateData: (fields: Partial<FormData>) => void,
  setActiveProjectLeadId: (id: string | null) => void
) {
  setActiveProjectLeadId(leadId);
  const lead = getLeadById(leadId);
  const resetDeep: Partial<FormData> = {};
  const init = initialFormData as unknown as Record<string, unknown>;
  for (const k of DEEP_EVAL_FORM_KEYS) {
    (resetDeep as unknown as Record<string, unknown>)[k] = init[k as string];
  }
  const draft = getDeepEvalDraft(leadId);
  if (lead) {
    updateData({
      userName: lead.name,
      userTitle: lead.salutation,
      userPhone: lead.phone,
      userCity: lead.city,
      userAgeRange: lead.ageGroup,
      userIndustry: lead.industry,
      projectName: lead.projectName,
      projectLocation: lead.projectPosition,
      projectArea: lead.area,
      projectType: lead.projectType,
      houseCondition: lead.handoverStatus,
      budgetStandard: lead.budget,
      ...resetDeep,
      ...draft,
    });
  }
}
