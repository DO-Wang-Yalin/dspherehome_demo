import type { ProjectBudgetData } from '../types'

/** 与线索「每平方造价」选项一致：纯数字或带文案的区间/以上 */
export function parseBudgetRangeToYuanPerSqm(budgetRange: string): number {
  const raw = String(budgetRange ?? '').trim()
  if (!raw) return 0
  if (/^\d+$/.test(raw)) return Number(raw)
  const norm = raw.replace(/,/g, '')
  const numbers = norm.match(/\d+/g)?.map(Number) ?? []
  if (numbers.length === 0) return 0
  if (norm.includes('以上') && numbers.length >= 1) return numbers[0]
  if (numbers.length >= 2) return Math.round((numbers[0] + numbers[1]) / 2)
  return numbers[0]
}

/**
 * 与预算拆解卡片同源：总面积 × 单价得下限，上限 +5%；写入项目中心 EPC 区间（万元）
 */
export function buildProjectBudgetFromAreaAndBudgetRange(
  areaRaw: string,
  budgetRangeRaw: string,
): ProjectBudgetData | null {
  const areaNum = Math.ceil(Math.max(0, parseFloat(String(areaRaw ?? '')) || 0))
  const yuanPerSqm = parseBudgetRangeToYuanPerSqm(String(budgetRangeRaw ?? ''))
  if (areaNum <= 0 || yuanPerSqm <= 0) return null
  const totalYuanLower = areaNum * yuanPerSqm
  const totalYuanUpper = totalYuanLower * 1.05
  const wanMin = Number((totalYuanLower / 10000).toFixed(2))
  const wanMax = Number((totalYuanUpper / 10000).toFixed(2))
  const mid = (wanMin + wanMax) / 2
  return {
    status: 'unconfirmed',
    epcRangeMin: wanMin,
    epcRangeMax: wanMax,
    epcDeposit: 0,
    epcWon: 0,
    orderTotalBudget: Number(mid.toFixed(2)),
    orderDeliveryTotal: 0,
    orderAcceptanceTotal: 0,
    orderSettledTotal: 0,
    adjustmentHistory: [],
  }
}
