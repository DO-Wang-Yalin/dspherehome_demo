import React from 'react'
import { toast } from 'sonner'
import BudgetSankey from './BudgetSankey'
import BudgetSankeyByEPE from './BudgetSankeyByEPE'
import { useGlobal } from '../context/GlobalContext'
import type { ProjectBudgetData } from '../types'

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
  return { ...defaultProjectBudget(), ...raw }
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
  const { data, updateData } = useGlobal()
  const b = mergeBudget(data.projectBudget)

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [modifyOpen, setModifyOpen] = React.useState(false)

  const epcRemainingDeposit = Math.max(0, Number((b.epcDeposit - b.epcWon).toFixed(2)))
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
      adjustmentHistory: [...(b.adjustmentHistory ?? []), entry],
    })
    toast.success('修改说明已提交，将尽快处理')
  }

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '—')

  return (
    <div className="space-y-8 pb-28 sm:pb-24">
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

      {/* EPC 预算拆解 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">EPC 预算拆解</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-4 border-b border-gray-100">
          <StatCell
            label="项目预算区间"
            value={`${fmt(b.epcRangeMin)} ~ ${fmt(b.epcRangeMax)}`}
            suffix="万"
          />
          <StatCell label="项目入金金额" value={fmt(b.epcDeposit)} valueClass="text-[#FBBF24]" />
          <StatCell label="已成交金额" value={fmt(b.epcWon)} valueClass="text-[#4887FF]" />
          <StatCell label="入金剩余金额" value={fmt(epcRemainingDeposit)} valueClass="text-[#F97316]" />
        </div>
        <BudgetSankeyByEPE unstyled />
      </section>

      {/* 订单预算拆解 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">订单预算拆解</h3>
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
        <div className="pointer-events-auto flex flex-col sm:flex-row gap-2 rounded-2xl border border-gray-200/90 bg-white/95 backdrop-blur-md p-2 shadow-lg shadow-gray-900/10">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex justify-center items-center rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#D85F00] transition-colors min-w-[8.5rem]"
          >
            确认当前预算
          </button>
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
        description="请描述希望如何调整预算分配（例如希望增减的类目、比例或区间等），提交后由项目方跟进。"
        placeholder="请填写您希望调整的预算分配说明…"
        submitLabel="提交"
        onSubmit={handleModify}
        requireNonEmpty
      />
    </div>
  )
}
