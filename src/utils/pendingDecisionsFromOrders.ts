/**
 * 待定决策 3 类标签：方案待反馈 | 报价单待确认（订购+交付）| 结算待确认
 */

export type PendingDecisionKind = 'scheme_feedback' | 'quotation_pending' | 'settlement_confirm'

export interface PendingDecisionItem {
  key: string
  kind: PendingDecisionKind
  orderId: string
  orderShortLabel: string
  title: string
  description: string
  badgeLabel: string
  /** feedback=设计反馈 | quotation=报价单签字/反馈 | settlement=结算单签字/反馈 | order=订单详情(S05) */
  action: 'feedback' | 'quotation' | 'settlement' | 'order'
  /** 报价单页用：订购场景 V2，交付场景 V3 */
  quotationVer?: string
}

export const ORDERS_WITH_FULL_DESIGN_FEEDBACK = new Set(['PSO-OD_LHJCF-00584'])

function orderTail(id: string): string {
  const parts = id.split('-')
  return parts[parts.length - 1] || id
}

const KIND_ORDER: Record<PendingDecisionKind, number> = {
  scheme_feedback: 0,
  quotation_pending: 1,
  settlement_confirm: 2,
}

export function computePendingDecisionsFromOrders(
  orders: Array<{ id: string; status?: string; feedbackSubmitted?: boolean; title?: string }>,
  resolvedKeys?: Set<string> | null,
): PendingDecisionItem[] {
  const resolved = resolvedKeys ?? new Set<string>()
  const items: PendingDecisionItem[] = []

  for (const o of orders) {
    const id = o.id
    const st = o.status ?? ''
    const tail = orderTail(id)
    const titleSuffix = o.title ? `（${o.title}）` : ''

    if (ORDERS_WITH_FULL_DESIGN_FEEDBACK.has(id) && !o.feedbackSubmitted) {
      items.push({
        key: `${id}-scheme-feedback`,
        kind: 'scheme_feedback',
        orderId: id,
        orderShortLabel: tail,
        title: `${tail} · 方案待反馈`,
        description: `请查看设计方案与效果图，并对关键空间逐条反馈。${titleSuffix}`,
        badgeLabel: '方案待反馈',
        action: 'feedback',
      })
      continue
    }

    if (ORDERS_WITH_FULL_DESIGN_FEEDBACK.has(id) && o.feedbackSubmitted && st.startsWith('S01')) {
      items.push({
        key: `${id}-scheme-s01`,
        kind: 'scheme_feedback',
        orderId: id,
        orderShortLabel: tail,
        title: `${tail} · 方案待反馈`,
        description: `意向沟通阶段请继续确认或补充方案意见。${titleSuffix}`,
        badgeLabel: '方案待反馈',
        action: 'feedback',
      })
      continue
    }

    if (st.startsWith('S05')) {
      items.push({
        key: `${id}-scheme-decision`,
        kind: 'scheme_feedback',
        orderId: id,
        orderShortLabel: tail,
        title: `${tail} · 方案待反馈`,
        description: `请对意向方案进行决策确认。${titleSuffix}`,
        badgeLabel: '客户决策',
        action: 'order',
      })
      continue
    }

    if (st.startsWith('S03')) {
      items.push({
        key: `${id}-quotation-ordering`,
        kind: 'quotation_pending',
        orderId: id,
        orderShortLabel: tail,
        title: `${tail} · 订购报价单待处理`,
        description: `请完成订购报价单的签字确认或调整反馈。${titleSuffix}`,
        badgeLabel: '订购报价',
        action: 'quotation',
        quotationVer: 'V2',
      })
      continue
    }

    if (st.includes('S06-02')) {
      items.push({
        key: `${id}-quotation-delivery`,
        kind: 'quotation_pending',
        orderId: id,
        orderShortLabel: tail,
        title: `${tail} · 交付报价单待处理`,
        description: `请完成交付报价单的签字确认或调整反馈。${titleSuffix}`,
        badgeLabel: '交付报价',
        action: 'quotation',
        quotationVer: 'V3',
      })
      continue
    }

    if (st.startsWith('S07')) {
      items.push({
        key: `${id}-settlement`,
        kind: 'settlement_confirm',
        orderId: id,
        orderShortLabel: tail,
        title: `${tail} · 结算待确认`,
        description: `请完成结算单的签字确认或意见反馈。${titleSuffix}`,
        badgeLabel: '结算待确认',
        action: 'settlement',
      })
      continue
    }
  }

  items.sort((a, b) => {
    const d = KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
    if (d !== 0) return d
    return a.orderId.localeCompare(b.orderId)
  })

  return items.filter((item) => !resolved.has(item.key))
}
