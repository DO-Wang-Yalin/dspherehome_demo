/**
 * 本地「我的线索」：待签约 → 签署合同后转为项目；深度测评按 leadId 绑定
 */

import type { FormData } from '../../types'
import {
  getLonghuJingchenfuDemoLead,
  LONGHU_JINGCHENFU_DEMO_LEAD_ID,
} from './longhuJingchenfuDemo'

export { LONGHU_JINGCHENFU_DEMO_LEAD_ID }

export type LeadStatus = 'pending_contract' | 'project'

export interface LeadFormSnapshot {
  projectType: string
  projectPosition: string
  handoverStatus: string
  area: string
  budget: string
  name: string
  salutation: string
  city: string
  phone: string
  ageGroup: string
  industry: string
  projectName: string
}

export interface UserLead extends LeadFormSnapshot {
  id: string
  createdAt: string
  updatedAt: string
  /** 待签合同 / 已转项目 */
  status: LeadStatus
  /** 签合同并转化后生成的项目 ID */
  projectId?: string
  /** 该线索下的合同签名（与 Global 合同分离，支持多线索） */
  contractSignatureData?: string
}

const STORAGE_KEY = 'ai-studio:user-leads:v2'

function migrateV1(raw: string): UserLead[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return null
    return parsed.map((row: Record<string, unknown>) => {
      const base = row as unknown as UserLead
      return {
        ...base,
        status: (base.status as LeadStatus) || 'pending_contract',
        projectId: base.projectId,
        contractSignatureData: base.contractSignatureData
      } as UserLead
    })
  } catch {
    return null
  }
}

function load(): UserLead[] {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      raw = localStorage.getItem('ai-studio:user-leads:v1')
      if (raw) {
        const migrated = migrateV1(raw)
        if (migrated?.length) {
          const withStatus = migrated.map((l) => ({
            ...l,
            status: (l.status || 'pending_contract') as LeadStatus
          }))
          localStorage.setItem(STORAGE_KEY, JSON.stringify(withStatus))
          return withStatus
        }
      }
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((l: UserLead) => ({
      ...l,
      status: l.status || 'pending_contract'
    }))
  } catch {
    return []
  }
}

function save(leads: UserLead[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  } catch {
    // ignore
  }
}

export function getUserLeads(): UserLead[] {
  return load().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getLeadById(id: string): UserLead | undefined {
  if (id === LONGHU_JINGCHENFU_DEMO_LEAD_ID) return getLonghuJingchenfuDemoLead()
  return load().find((l) => l.id === id)
}

/** 主导航深度测评后全局 FormData → 线索快照（用于无 leadId 签约时落库） */
export function buildLeadSnapshotFromFormData(d: FormData): LeadFormSnapshot {
  return {
    projectType: d.projectType ?? '',
    projectPosition: d.projectLocation ?? '',
    handoverStatus: d.houseCondition ?? '',
    area: d.projectArea ?? '',
    budget: d.budgetStandard ?? '',
    name: d.userName ?? '',
    salutation: d.userTitle ?? '',
    city: d.userCity ?? '',
    phone: d.userPhone ?? '',
    ageGroup: d.userAgeRange ?? '',
    industry: d.userIndustry ?? '',
    projectName: d.projectName ?? '',
  }
}

export function addUserLead(snapshot: LeadFormSnapshot): UserLead {
  const now = new Date().toISOString()
  const lead: UserLead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    status: 'pending_contract',
    ...snapshot
  }
  const list = load()
  list.unshift(lead)
  save(list)
  return lead
}

export function updateUserLead(
  id: string,
  snapshot: Partial<LeadFormSnapshot> & Partial<Pick<UserLead, 'status' | 'projectId' | 'contractSignatureData'>>
): UserLead | null {
  const list = load()
  const i = list.findIndex((l) => l.id === id)
  if (i < 0) return null
  const updated: UserLead = {
    ...list[i],
    ...snapshot,
    updatedAt: new Date().toISOString()
  }
  list[i] = updated
  save(list)
  return updated
}

export function deleteUserLead(id: string): boolean {
  if (id === LONGHU_JINGCHENFU_DEMO_LEAD_ID) return false
  const list = load()
  const next = list.filter((l) => l.id !== id)
  if (next.length === list.length) return false
  save(next)
  try {
    localStorage.removeItem(`ai-studio:deep-eval:${id}`)
  } catch {
    // ignore
  }
  return true
}

/**
 * 合同签署完成：写入签名并将线索转为项目
 */
export function convertLeadOnContractSign(
  leadId: string,
  contractSignatureData: string
): { projectId: string } | null {
  const list = load()
  const i = list.findIndex((l) => l.id === leadId)
  if (i < 0) return null
  const lead = list[i]
  if (lead.status === 'project' && lead.projectId) {
    return { projectId: lead.projectId }
  }
  const projectId = `p-${Date.now()}`
  list[i] = {
    ...lead,
    contractSignatureData,
    status: 'project',
    projectId,
    updatedAt: new Date().toISOString()
  }
  save(list)
  return { projectId }
}

export function getPendingLeads(): UserLead[] {
  return getUserLeads().filter((l) => l.status === 'pending_contract')
}

export function getConvertedLeads(): UserLead[] {
  return getUserLeads().filter((l) => l.status === 'project' && l.projectId)
}

/** 项目页「已签约」列表：首位固定展示演示项目龙湖璟宸府（完整数据，不落库） */
export function getConvertedLeadsForProjectPage(): UserLead[] {
  const demo = getLonghuJingchenfuDemoLead()
  const rest = load()
    .filter(
      (l) =>
        l.status === 'project' &&
        l.projectId &&
        l.id !== LONGHU_JINGCHENFU_DEMO_LEAD_ID
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  return [demo, ...rest]
}
