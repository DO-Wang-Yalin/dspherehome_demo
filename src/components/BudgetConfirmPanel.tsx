import React from 'react'
import { toast } from 'sonner'
import BudgetSankey from './BudgetSankey'
import BudgetSankeyByEPE from './BudgetSankeyByEPE'
import { useGlobal } from '../context/GlobalContext'
import type { ProjectBudgetData } from '../types'
import { LONGHU_JINGCHENFU_DEMO_LEAD_ID } from '../services/leads/savedLeadsStorage'

function defaultProjectBudget(): ProjectBudgetData {
  return {
    status: 'unconfirmed',
    epcRangeMin: 45,
    epcRangeMax: 50,
    epcDeposit: 26,
    epcWon: 15.5,
    orderTotalBudget: 50,
    orderDeliveryTotal: 12,
    orderAcceptanceTotal: 8,
    orderSettledTotal: 15.5,
    adjustmentHistory: [],
  }
}

function mergeBudget(raw: Partial<ProjectBudgetData> | undefined): ProjectBudgetData {
  const b = { ...defaultProjectBudget(), ...raw }
  if (b.status === 'confirmed' && b.confirmedAt && (b.adjustmentHistory?.length ?? 0) > 0) {
    const confirmedMs = new Date(b.confirmedAt).getTime()
    const hasNewerAdjustment = b.adjustmentHistory!.some((h) => new Date(h.at).getTime() > confirmedMs)
    if (hasNewerAdjustment) {
      return { ...b, status: 'unconfirmed' }
    }
  }
  return b
}

/** 演示用收款信息（正式环境可由项目/后端配置） */
const DEPOSIT_PAYMENT_INFO = {
  payeeName: '深圳市示例家居服务有限公司',
  bankName: '中国工商银行深圳高新支行',
  accountNo: '6222024000012345678',
  remark: '转账请备注：项目入金 + 您的合同编号或项目名称',
} as const

function copyToClipboard(text: string, okMsg = '已复制到剪贴板') {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(okMsg),
    () => toast.error('复制失败，请手动长按选择复制')
  )
}

function DepositPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  const fullText = [
    `收款户名：${DEPOSIT_PAYMENT_INFO.payeeName}`,
    `开户银行：${DEPOSIT_PAYMENT_INFO.bankName}`,
    `银行账号：${DEPOSIT_PAYMENT_INFO.accountNo}`,
    DEPOSIT_PAYMENT_INFO.remark,
  ].join('\n')

  const Row = ({
    label,
    value,
  }: {
    label: string
    value: string
  }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900 font-medium break-all select-all">{value}</div>
        </div>
        <button
          type="button"
          onClick={() => copyToClipboard(value, `已复制${label}`)}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          复制
        </button>
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-payment-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <h3 id="deposit-payment-title" className="text-base font-semibold text-gray-900">
            增加入金 · 付款账号
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            请向以下对公账户转账完成入金。可复制单项或一键复制全部信息，转账后请保留凭证并联系项目顾问核对。
          </p>
        </div>
        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          <Row label="收款户名" value={DEPOSIT_PAYMENT_INFO.payeeName} />
          <Row label="开户银行" value={DEPOSIT_PAYMENT_INFO.bankName} />
          <Row label="银行账号" value={DEPOSIT_PAYMENT_INFO.accountNo} />
          <Row label="转账备注" value={DEPOSIT_PAYMENT_INFO.remark} />
        </div>
        <div className="px-5 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(fullText, '已复制全部付款信息')}
            className="rounded-xl bg-[#EF6B00] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#D85F00]"
          >
            一键复制全部
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  suffix = '万',
  valueClass = 'text-gray-900',
}: {
  label: string
  value: string
  suffix?: string
  valueClass?: string
}) {
  return (
    <div className="space-y-1 min-w-0">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className={`text-lg sm:text-xl font-bold tabular-nums ${valueClass}`}>{value}</span>
        {suffix ? <span className="text-xs text-gray-500 shrink-0">{suffix}</span> : null}
      </div>
    </div>
  )
}

function BudgetModal({
  open,
  title,
  description,
  placeholder,
  submitLabel,
  onClose,
  onSubmit,
  requireNonEmpty,
}: {
  open: boolean
  title: string
  description: string
  placeholder: string
  submitLabel: string
  onClose: () => void
  onSubmit: (text: string) => void
  requireNonEmpty?: boolean
}) {
  const [text, setText] = React.useState('')

  React.useEffect(() => {
    if (open) setText('')
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    const t = text.trim()
    if (requireNonEmpty && !t) {
      toast.error('请填写内容')
      return
    }
    onSubmit(t)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 id="budget-modal-title" className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="px-5 py-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9C3E]/25 focus:border-[#FF9C3E] resize-y min-h-[120px]"
          />
        </div>
        <div className="px-5 py-4 bg-gray-50/80 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-[#EF6B00] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#D85F00]"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function BudgetConfirmPanel() {
  const { data, updateData, activeProjectLeadId } = useGlobal()
  const b = mergeBudget(data.projectBudget)
  const isNonDemoProject =
    !!activeProjectLeadId && activeProjectLeadId !== LONGHU_JINGCHENFU_DEMO_LEAD_ID
  const budgetUnset =
    isNonDemoProject &&
    b.status === 'unconfirmed' &&
    b.epcRangeMin === 0 &&
    b.epcRangeMax === 0 &&
    b.orderTotalBudget === 0

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [modifyOpen, setModifyOpen] = React.useState(false)
  /** 预算拆解分页：EPC / 订单 */
  const [budgetPage, setBudgetPage] = React.useState<'epc' | 'order'>('epc')
  const [depositPaymentOpen, setDepositPaymentOpen] = React.useState(false)

  /** 入金剩余 = 项目入金 − 已成交金额，可为负 */
  const epcRemainingDeposit = Number((b.epcDeposit - b.epcWon).toFixed(2))
  const orderRemainingBudget = Number(
    (b.orderTotalBudget - b.orderDeliveryTotal - b.orderAcceptanceTotal - b.orderSettledTotal).toFixed(2)
  )

  const persist = (next: ProjectBudgetData) => {
    updateData({ projectBudget: next })
  }

  const handleConfirm = (note: string) => {
    const next: ProjectBudgetData = {
      ...b,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      lastConfirmNote: note || undefined,
    }
    persist(next)
    toast.success('已确认当前预算')
  }

  const handleModify = (text: string) => {
    const entry = { at: new Date().toISOString(), text }
    persist({
      ...b,
      status: 'unconfirmed',
      adjustmentHistory: [...(b.adjustmentHistory ?? []), entry],
    })
    toast.success('修改说明已提交，请再次确认预算')
  }

  /** 已确认且无新的「待确认」状态时，不必重复点确认 */
  const budgetAlreadyConfirmed = b.status === 'confirmed'

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '—')

  return (
    <div className="space-y-8 pb-28 sm:pb-24">
      {budgetUnset ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">预算与入金数据待同步</p>
          <p className="mt-1 text-xs text-amber-900/85 leading-relaxed">
            方案与报价确认后，顾问将为您维护 EPC 区间与订单拆解；您也可主动联系顾问补充或确认预算。
          </p>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
              b.status === 'confirmed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {b.status === 'confirmed' ? '已确认' : '未确认'}
          </span>
          {b.status === 'confirmed' && b.confirmedAt ? (
            <span className="text-xs text-gray-400">
              确认于 {new Date(b.confirmedAt).toLocaleString('zh-CN')}
            </span>
          ) : null}
        </div>
      </div>

      {/* 预算拆解：分页（页签）切换 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-xl border border-gray-200 p-0.5 bg-gray-50"
            role="tablist"
            aria-label="预算拆解分页"
          >
            <button
              type="button"
              role="tab"
              aria-selected={budgetPage === 'epc'}
              onClick={() => setBudgetPage('epc')}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                budgetPage === 'epc'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              EPC 预算拆解
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={budgetPage === 'order'}
              onClick={() => setBudgetPage('order')}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                budgetPage === 'order'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              订单预算拆解
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {budgetPage === 'epc' ? '按 E/P/C 与成交状态' : '按里程碑与订单维度'}
          </span>
        </div>

        {budgetPage === 'epc' ? (
          <div className="space-y-4 pt-1" role="tabpanel">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-4 border-b border-gray-100">
              <StatCell
                label="项目预算区间"
                value={`${fmt(b.epcRangeMin)} ~ ${fmt(b.epcRangeMax)}`}
                suffix="万"
              />
              <StatCell label="项目入金金额" value={fmt(b.epcDeposit)} valueClass="text-[#FBBF24]" />
              <StatCell label="已成交金额" value={fmt(b.epcWon)} valueClass="text-[#4887FF]" />
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    入金剩余金额
                  </div>
                  <button
                    type="button"
                    onClick={() => setDepositPaymentOpen(true)}
                    className="shrink-0 rounded-lg border border-[#EF6B00]/30 bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#D85F00] hover:bg-orange-100"
                  >
                    增加入金
                  </button>
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span
                    className={`text-lg sm:text-xl font-bold tabular-nums ${
                      epcRemainingDeposit < 0
                        ? 'text-red-600'
                        : epcRemainingDeposit > 0
                          ? 'text-[#F97316]'
                          : 'text-gray-600'
                    }`}
                  >
                    {fmt(epcRemainingDeposit)}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">万</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">项目入金 − 已成交金额</p>
              </div>
            </div>
            <BudgetSankeyByEPE unstyled />
          </div>
        ) : (
          <div className="space-y-4 pt-1" role="tabpanel">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 pb-4 border-b border-gray-100">
              <StatCell label="项目总预算" value={fmt(b.orderTotalBudget)} />
              <StatCell label="交付期订单总额" value={fmt(b.orderDeliveryTotal)} valueClass="text-violet-700" />
              <StatCell label="验收期订单总额" value={fmt(b.orderAcceptanceTotal)} valueClass="text-orange-700" />
              <StatCell label="已结算订单总额" value={fmt(b.orderSettledTotal)} valueClass="text-blue-700" />
              <StatCell
                label="预算剩余金额"
                value={fmt(orderRemainingBudget)}
                valueClass={orderRemainingBudget >= 0 ? 'text-emerald-700' : 'text-red-600'}
              />
            </div>
            <BudgetSankey unstyled title="订单预算拆解" subtitle="按里程碑与订单维度的预算流动" />
          </div>
        )}
      </section>

      {/* 记录与说明（按钮固定在视口右下角） */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        {b.lastConfirmNote ? (
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-600">最近确认说明：</span>
            {b.lastConfirmNote}
          </p>
        ) : null}
        {b.adjustmentHistory && b.adjustmentHistory.length > 0 ? (
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-600 mb-2">修改预算分配记录</div>
            <ul className="space-y-2 max-h-32 overflow-y-auto text-xs text-gray-500">
              {[...b.adjustmentHistory].reverse().map((h, i) => (
                <li key={`${h.at}-${i}`} className="border-l-2 border-gray-200 pl-2">
                  <span className="text-gray-400">{new Date(h.at).toLocaleString('zh-CN')}</span>
                  <div className="text-gray-700 mt-0.5">{h.text}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {!b.lastConfirmNote && (!b.adjustmentHistory || b.adjustmentHistory.length === 0) ? (
          <p className="text-xs text-gray-400">确认或修改预算后，说明与记录将显示在此处。</p>
        ) : null}
      </div>

      {/* 常显：右下角固定操作 */}
      <div
        className="fixed z-[70] flex flex-col sm:flex-row gap-2 sm:items-center pointer-events-none"
        style={{
          bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
          right: 'max(1rem, env(safe-area-inset-right, 0px))',
        }}
      >
        <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border border-gray-200/90 bg-white/95 backdrop-blur-md p-2 shadow-lg shadow-gray-900/10">
          {budgetAlreadyConfirmed ? (
            <div className="flex items-center gap-2 px-3 py-2 min-w-0">
              <span className="text-xs text-gray-500 whitespace-nowrap">预算已确认</span>
              <span className="text-[11px] text-gray-400 hidden sm:inline">提交修改说明后需再次确认</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex justify-center items-center rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#D85F00] transition-colors min-w-[8.5rem]"
            >
              确认当前预算
            </button>
          )}
          <button
            type="button"
            onClick={() => setModifyOpen(true)}
            className="inline-flex justify-center items-center rounded-xl bg-white text-sm font-medium px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors min-w-[8.5rem]"
          >
            修改预算分配
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        演示环境：指标为示例数据；确认与修改说明保存在当前会话状态中。
      </p>

      <BudgetModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="确认当前预算"
        description="确认后预算状态将变为「已确认」。可填写备注（选填），例如本次确认的口径或约定。"
        placeholder="选填：确认说明、约定事项…"
        submitLabel="确认"
        onSubmit={handleConfirm}
      />

      <BudgetModal
        open={modifyOpen}
        onClose={() => setModifyOpen(false)}
        title="修改预算分配"
        description="请描述希望如何调整预算分配（例如希望增减的类目、比例或区间等）。提交后需再次点击「确认当前预算」；仅浏览、无修改时无需重复确认。"
        placeholder="请填写您希望调整的预算分配说明…"
        submitLabel="提交"
        onSubmit={handleModify}
        requireNonEmpty
      />

      <DepositPaymentModal open={depositPaymentOpen} onClose={() => setDepositPaymentOpen(false)} />
    </div>
  )
}
