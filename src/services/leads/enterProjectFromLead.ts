/**
 * 选中某条已转化线索进入项目工作台：同步全局表单 + 深度测评草稿
 */
import type { FormData, ProjectBudgetData } from '../../types';
import { getDeepEvalDraft, pickDeepEvalPatch } from './deepEvalByLeadStorage';
import {
  getLonghuJingchenfuFullFormData,
  LONGHU_JINGCHENFU_DEMO_LEAD_ID,
} from './longhuJingchenfuDemo';
import { getEmptyNonDemoProjectFormPatch } from './nonDemoProjectFormBaseline';
import { getLeadById, type UserLead } from './savedLeadsStorage';
import { buildProjectBudgetFromAreaAndBudgetRange } from '../../utils/projectBudgetFromBreakdown';

function pickStyleEvalCarryover(session: FormData): Partial<FormData> {
  const o: Partial<FormData> = {};
  if ((session.styleId ?? '').trim()) o.styleId = session.styleId;
  if ((session.styleName ?? '').trim()) o.styleName = session.styleName;
  if ((session.colorGene ?? '').trim()) o.colorGene = session.colorGene;
  if ((session.styleSuggestions ?? '').trim()) o.styleSuggestions = session.styleSuggestions;
  return o;
}

function resolveProjectBudgetForEntry(
  lead: UserLead | undefined,
  draft: Partial<FormData>
): ProjectBudgetData | undefined {
  const d = draft.projectBudget;
  if (d && ((d.epcRangeMin ?? 0) > 0 || (d.epcRangeMax ?? 0) > 0)) {
    return { ...d };
  }
  if (lead) {
    const fromLead = buildProjectBudgetFromAreaAndBudgetRange(lead.area, lead.budget);
    if (fromLead) return fromLead;
  }
  return undefined;
}

/**
 * @param sessionFormData 当前浏览器会话中的全局表单（完整链路桥接完成后内存里仍保留的深度测评/风格/预算等）
 */
export function enterProjectWorkbenchFromLead(
  leadId: string,
  updateData: (fields: Partial<FormData>) => void,
  setActiveProjectLeadId: (id: string | null) => void,
  sessionFormData?: FormData
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
  const sessionCarry: Partial<FormData> =
    sessionFormData != null
      ? { ...pickDeepEvalPatch(sessionFormData), ...pickStyleEvalCarryover(sessionFormData) }
      : {};
  delete sessionCarry.projectBudget;

  const projectBudget = resolveProjectBudgetForEntry(lead, draft);

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
      ...sessionCarry,
      ...(projectBudget ? { projectBudget } : {}),
    });
  } else {
    updateData({
      ...baseline,
      ...draft,
      ...sessionCarry,
      ...(projectBudget ? { projectBudget } : {}),
    });
  }
}
