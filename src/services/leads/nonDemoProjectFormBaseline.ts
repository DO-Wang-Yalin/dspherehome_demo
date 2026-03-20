/**
 * 非「龙湖璟宸府」演示项目：进入工作台时的表单基线——仅保留线索/深度测评草稿中有值的字段，其余为空，避免沿用全局演示数据。
 */
import type { FormData, ProjectBudgetData } from '../../types'
import { initialFormData } from '../../types'
import { DEEP_EVAL_FORM_KEYS } from './deepEvalByLeadStorage'

const EMPTY_PROJECT_BUDGET: ProjectBudgetData = {
  status: 'unconfirmed',
  epcRangeMin: 0,
  epcRangeMax: 0,
  epcDeposit: 0,
  epcWon: 0,
  orderTotalBudget: 0,
  orderDeliveryTotal: 0,
  orderAcceptanceTotal: 0,
  orderSettledTotal: 0,
  adjustmentHistory: [],
}

const DEEP_EVAL_ARRAY_KEYS = new Set<string>([
  'requirementsMembers',
  'customCoreSpaceOptions',
  'floorPlanImages',
  'siteMedia',
  'customSpaceItems',
])

const DEEP_RECORD_OBJECT_KEYS = new Set<string>([
  'otherCoreMemberSpaces',
  'otherCoreMemberNotes',
  'additionalMemberNotes',
])

function emptyValueForDeepEvalKey(k: (typeof DEEP_EVAL_FORM_KEYS)[number]): unknown {
  if (DEEP_EVAL_ARRAY_KEYS.has(k)) return []
  if (DEEP_RECORD_OBJECT_KEYS.has(k as string)) return {}
  // TS2352: 先 cast 到 unknown 再 cast 到可索引类型，避免不安全转换告警
  const sample = (initialFormData as unknown as Record<string, unknown>)[k as string]
  if (Array.isArray(sample)) return []
  if (typeof sample === 'boolean') return false
  return ''
}

export function getEmptyNonDemoProjectFormPatch(): Partial<FormData> {
  const patch: Record<string, unknown> = {
    orders: [],
    requirementDocRevisions: [],
    projectBudget: { ...EMPTY_PROJECT_BUDGET },
    houseType: '',
    budgetSubStandard: '',
    userHeight: '',
    styleId: '',
    styleName: '',
    colorGene: '',
    styleSuggestions: '',
    contractCustomText: '',
  }
  for (const k of DEEP_EVAL_FORM_KEYS) {
    patch[k as string] = emptyValueForDeepEvalKey(k)
  }
  return patch as Partial<FormData>
}
