/**
 * 选中某条已转化线索进入项目工作台：同步全局表单 + 深度测评草稿
 */
import type { FormData } from '../../types';
import { getDeepEvalDraft } from './deepEvalByLeadStorage';
import {
  getLonghuJingchenfuFullFormData,
  LONGHU_JINGCHENFU_DEMO_LEAD_ID,
} from './longhuJingchenfuDemo';
import { getEmptyNonDemoProjectFormPatch } from './nonDemoProjectFormBaseline';
import { getLeadById } from './savedLeadsStorage';

export function enterProjectWorkbenchFromLead(
  leadId: string,
  updateData: (fields: Partial<FormData>) => void,
  setActiveProjectLeadId: (id: string | null) => void
) {
  setActiveProjectLeadId(leadId);
  /** 演示项目：始终载入完整需求数据。不合并本地深度测评草稿，避免空草稿覆盖成员/空间等字段导致「用户需求」为空 */
  if (leadId === LONGHU_JINGCHENFU_DEMO_LEAD_ID) {
    updateData(getLonghuJingchenfuFullFormData());
    return;
  }
  const lead = getLeadById(leadId);
  const baseline = getEmptyNonDemoProjectFormPatch();
  const draft = getDeepEvalDraft(leadId);
  if (lead) {
    updateData({
      ...baseline,
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
      contractAccepted: !!lead.contractSignatureData,
      contractSignatureData: lead.contractSignatureData || '',
      ...draft,
    });
  } else {
    updateData({ ...baseline, ...draft });
  }
}
