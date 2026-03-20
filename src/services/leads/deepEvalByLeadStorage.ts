/**
 * 深度测评草稿按线索 leadId 隔离存储，与线索绑定
 */
import type { FormData } from '../../types'

const PREFIX = 'ai-studio:deep-eval:'

/** 深度测评步骤（含原风格 q8–q10 衔接题 + Step4～Step21）会写入的 FormData 字段 */
export const DEEP_EVAL_FORM_KEYS = [
  'floorPlanUploaded',
  'houseUsage',
  'lighting',
  'ceilingHeight',
  'ventilation',
  'noise',
  'styleEvalQ8Positioning',
  'styleEvalQ9Selections',
  'styleEvalQ9Quantities',
  'styleEvalQ10Needs',
  'role',
  'favoriteSpace',
  'otherCoreMemberSpaces',
  'otherCoreMemberNotes',
  'additionalMembers',
  'daughterSpaces',
  'sonSpaces',
  'catSpaces',
  'dogSpaces',
  'additionalMemberNotes',
  'requirementsMembers',
  'collaboration',
  'involvement',
  'timeline',
  'coreSpaces',
  'customCoreSpaceOptions',
  'childGrowth',
  'guestStay',
  'futureChanges',
  'cookingHabit',
  'secondKitchen',
  'diningCount',
  'festivalDiningCount',
  'partyFrequency',
  'livingRoomActivity',
  'livingRoomFeature',
  'storageFocus',
  'dryWetSeparation',
  'bottomLine',
  'fengshui',
  'smartHome',
  'smartHomeOptions',
  'comfortSystems',
  'devices',
  'accessibility',
  'oldFurniture',
  'otherNeeds',
  'otherNeedsOptions',
  'spaceOtherNote',
  'livingRoomNote',
  'diningNote',
  'kitchenNote',
  'bathroomNote',
  'floorPlanImages',
  'siteMedia',
  'customSpaceItems'
] as const satisfies readonly (keyof FormData)[]

type DeepEvalKey = (typeof DEEP_EVAL_FORM_KEYS)[number]

function pickDeepEvalPatch(obj: Partial<FormData>): Partial<FormData> {
  const out: Partial<FormData> = {}
  for (const k of DEEP_EVAL_FORM_KEYS) {
    if (k in obj && (obj as Record<string, unknown>)[k] !== undefined) {
      ;(out as Record<string, unknown>)[k] = (obj as Record<string, unknown>)[k]
    }
  }
  return out
}

export function getDeepEvalDraft(leadId: string): Partial<FormData> {
  try {
    const raw = localStorage.getItem(PREFIX + leadId)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<FormData>
    return pickDeepEvalPatch(parsed)
  } catch {
    return {}
  }
}

export function saveDeepEvalDraftMerge(leadId: string, patch: Partial<FormData>) {
  const picked = pickDeepEvalPatch(patch)
  if (Object.keys(picked).length === 0) return
  try {
    const prev = getDeepEvalDraft(leadId)
    const next = { ...prev, ...picked }
    localStorage.setItem(PREFIX + leadId, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function clearDeepEvalDraft(leadId: string) {
  try {
    localStorage.removeItem(PREFIX + leadId)
  } catch {
    // ignore
  }
}
