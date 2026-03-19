import React from 'react'
import { toast } from 'sonner'
import BudgetSankey from './BudgetSankey'
import BudgetSankeyByEPE from './BudgetSankeyByEPE'
import { useGlobal } from '../context/GlobalContext'
import type { ProjectBudgetData } from '../types'
import { LONGHU_JINGCHENFU_DEMO_LEAD_ID } from '../services/leads/savedLeadsStorage'
import { FileText } from 'lucide-react'
import { copyTextToClipboard } from '../utils/copyText'
import {
  buildBudgetSankeyFromProjectBudget,
  buildEpcPiePaths,
  getEpcAllocationFromProjectBudget,
} from '../utils/ordersToBudgetSankey'

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

function DepositPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  if (!open) return null

  const { payeeName, bankName, accountNo, remark } = DEPOSIT_PAYMENT_INFO
  const fullText = [
    `账户名称：${payeeName}`,
    `开户银行：${bankName}`,
    `银行账号：${accountNo}`,
    remark,
  ].join('\n')

  const handleCopy = () => {
    void copyTextToClipboard(fullText).then((ok) => {
      if (ok) {
        setCopied(true)
        toast.success('已复制全部付款信息')
        window.setTimeout(() => setCopied(false), 2000)
      } else {
        toast.error('复制失败，请长按文字手动复制')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-payment-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-2 shrink-0 border-b border-gray-100">
          <h3 id="deposit-payment-title" className="text-lg font-semibold text-gray-900">
            增加入金 · 付款账号
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            请根据以下信息进行转账完成入金。
          </p>
        </div>
        <div className="px-5 py-5 overflow-y-auto flex-1 space-y-5">
          {/* 与 StepPayment「意向金支付账号信息」卡片同风格 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#EF6B00]" />
              <span className="text-sm font-semibold text-gray-900">对公转账信息</span>
            </div>
            <div className="space-y-1.5 text-sm text-gray-800">
              <p>账户名称：{payeeName}</p>
              <p>开户银行：{bankName}</p>
              <p>银行账号：{accountNo}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 w-full rounded-xl bg-[#FF9C3E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
            >
              {copied ? '已复制账号信息' : '一键复制全部信息'}
            </button>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">{remark}</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            转账完成后请保留凭证并联系项目顾问核对到账；如有疑问可随时咨询顾问。
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

/** 桑基图上方：独立指标卡片（语义色条 + 轻层次） */
function BudgetMetricCard({
  label,
  value,
  suffix = '万',
  valueClass = 'text-gray-900',
  accent = 'slate',
  hint,
  action,
}: {
  label: string
  value: string
  suffix?: string
  valueClass?: string
  accent?: 'slate' | 'amber' | 'blue' | 'orange' | 'violet' | 'emerald' | 'rose'
  hint?: string
  action?: React.ReactNode
}) {
  const bar: Record<string, string> = {
    slate: 'from-slate-500 to-slate-400',
    amber: 'from-amber-500 to-amber-400',
    blue: 'from-blue-500 to-blue-400',
    orange: 'from-orange-500 to-orange-400',
    violet: 'from-violet-500 to-violet-400',
    emerald: 'from-emerald-500 to-emerald-400',
    rose: 'from-rose-500 to-rose-400',
  }
  return (
    <div
      className={[
        'group relative flex flex-col min-h-[5.5rem] rounded-2xl border border-gray-100/90 bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.04)]',
        'hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-gray-200/90 transition-all duration-200',
        'overflow-hidden',
      ].join(' ')}
    >
      <div className={`h-1 w-full shrink-0 bg-gradient-to-r ${bar[accent]}`} aria-hidden />
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 pt-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-400 leading-tight">
            {label}
          </span>
          {action ? <div className="shrink-0 -mr-0.5 -mt-0.5">{action}</div> : null}
        </div>
        <div className="mt-2 flex items-baseline gap-1 flex-wrap">
          <span
            className={`text-xl sm:text-2xl font-semibold tabular-nums tracking-tight ${valueClass}`}
          >
            {value}
          </span>
          {suffix ? (
            <span className="text-xs font-medium text-gray-400 shrink-0 translate-y-0.5">{suffix}</span>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-2 text-[10px] leading-snug text-gray-400 border-t border-gray-100/80 pt-2">
            {hint}
          </p>
        ) : null}
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-300"
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

/** EPC 页签：卡片与桑基图之间的饼图 + E/P/C 金额，配色与 BudgetSankeyByEPE 一致 */
function EpcBudgetPieSection({ budget }: { budget: ProjectBudgetData }) {
  const alloc = React.useMemo(() => getEpcAllocationFromProjectBudget(budget), [budget])
  if (!alloc) {
    return (
      <div
        className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center"
        role="status"
      >
        <p className="text-sm text-gray-500">完善项目预算区间后，将展示 E / P / C 预算拆解饼图</p>
        <p className="text-xs text-gray-400 mt-1.5">与线索阶段预算分配口径一致</p>
      </div>
    )
  }
  const paths = buildEpcPiePaths(alloc.segments, alloc.totalWan)
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden"
      aria-label="EPC 预算拆解饼图"
    >
      <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100/90 bg-gradient-to-r from-gray-50/80 to-white">
        <h3 className="text-sm font-semibold text-gray-800 tracking-tight">预算拆解 · E / P / C</h3>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
          按预算区间中值 <span className="text-gray-500 font-medium tabular-nums">{alloc.totalWan}</span>{' '}
          万拆分，与下方桑基图口径一致
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-8 px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex justify-center shrink-0 mx-auto sm:mx-0 w-[min(100%,220px)] max-w-[220px] aspect-square">
          <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
            {paths.map(
              (p) =>
                p.d && p.sweep > 0.2 ? (
                  <path
                    key={p.key}
                    d={p.d}
                    fill={p.color}
                    stroke="#fff"
                    strokeWidth={2}
                    className="transition-opacity duration-200 hover:opacity-90"
                  />
                ) : null,
            )}
            <circle cx={100} cy={100} r={46} fill="#F9FAFB" stroke="#E5E7EB" strokeWidth={1} />
            <text
              x={100}
              y={92}
              textAnchor="middle"
              fill="#9CA3AF"
              fontSize={10}
              fontWeight={600}
              style={{ letterSpacing: '0.06em' }}
            >
              参考总预算
            </text>
            <text x={100} y={114} textAnchor="middle" fill="#1F2937" fontSize={17} fontWeight={700}>
              {alloc.totalWan}
              <tspan fontSize={11} fontWeight={600} fill="#6B7280">
                {' '}
                万
              </tspan>
            </text>
          </svg>
        </div>
        <ul className="flex-1 min-w-0 space-y-2 sm:space-y-2.5">
          {alloc.segments.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100/90 bg-gradient-to-r from-white to-gray-50/40 px-3.5 py-2.5 sm:py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="shrink-0 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 leading-tight">{s.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 tabular-nums">占比 {s.pct.toFixed(0)}%</div>
                </div>
              </div>
              <div className="text-right shrink-0 tabular-nums">
                <span className="text-base sm:text-lg font-semibold text-gray-900">{s.wan.toFixed(1)}</span>
                <span className="text-xs font-medium text-gray-400 ml-0.5">万</span>
              </div>
            </li>
          ))}
        </ul>
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

  const epcSankeyData = React.useMemo(
    () => buildBudgetSankeyFromProjectBudget(b),
    [b],
  )

  return (
    <div className="space-y-8 pb-28 sm:pb-24 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
      {budgetUnset ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          <p className="font-medium">预算与入金数据待同步</p>
          <p className="mt-1 text-xs text-amber-900/85 leading-relaxed">
            方案与报价确认后，顾问将为您维护 EPC 区间与订单拆解；您也可主动联系顾问补充或确认预算。
          </p>
        </div>
      ) : null}

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
          <div className="space-y-5 pt-1 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" role="tabpanel">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <BudgetMetricCard
                accent="slate"
                label="项目预算区间"
                value={`${fmt(b.epcRangeMin)} ~ ${fmt(b.epcRangeMax)}`}
                suffix="万"
                valueClass="text-slate-800"
                hint="EPC 合理区间，可在顾问协助下微调"
              />
              <BudgetMetricCard
                accent="amber"
                label="项目入金金额"
                value={fmt(b.epcDeposit)}
                valueClass="text-amber-600"
                hint="已到账入金合计"
              />
              <BudgetMetricCard
                accent="blue"
                label="已成交金额"
                value={fmt(b.epcWon)}
                valueClass="text-blue-600"
                hint="已签约成交对应金额"
              />
              <BudgetMetricCard
                accent={epcRemainingDeposit < 0 ? 'rose' : 'orange'}
                label="入金剩余金额"
                value={fmt(epcRemainingDeposit)}
                valueClass={
                  epcRemainingDeposit < 0
                    ? 'text-rose-600'
                    : epcRemainingDeposit > 0
                      ? 'text-orange-600'
                      : 'text-gray-600'
                }
                hint="项目入金 − 已成交金额，可为负"
                action={
                  <button
                    type="button"
                    onClick={() => setDepositPaymentOpen(true)}
                    className="rounded-lg bg-gradient-to-b from-[#FF9C3E] to-[#EF6B00] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:brightness-105 active:scale-[0.98] transition"
                  >
                    增加入金
                  </button>
                }
              />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" aria-hidden />
            <EpcBudgetPieSection budget={b} />
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" aria-hidden />
            <BudgetSankeyByEPE unstyled chartBleed data={epcSankeyData} />
          </div>
        ) : (
          <div className="space-y-5 pt-1 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300" role="tabpanel">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <BudgetMetricCard
                accent="slate"
                label="项目总预算"
                value={fmt(b.orderTotalBudget)}
                valueClass="text-slate-800"
                hint="订单维度总包预算"
              />
              <BudgetMetricCard
                accent="violet"
                label="交付期订单总额"
                value={fmt(b.orderDeliveryTotal)}
                valueClass="text-violet-600"
                hint="交付阶段订单合计"
              />
              <BudgetMetricCard
                accent="orange"
                label="验收期订单总额"
                value={fmt(b.orderAcceptanceTotal)}
                valueClass="text-orange-600"
                hint="验收阶段订单合计"
              />
              <BudgetMetricCard
                accent="blue"
                label="已结算订单总额"
                value={fmt(b.orderSettledTotal)}
                valueClass="text-blue-600"
                hint="已走完结算流程"
              />
              <BudgetMetricCard
                accent={orderRemainingBudget < 0 ? 'rose' : 'emerald'}
                label="预算剩余金额"
                value={fmt(orderRemainingBudget)}
                valueClass={orderRemainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                hint="总预算扣减各期占用"
                action={
                  orderRemainingBudget < 0 ? (
                    <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-rose-100">
                      超支
                    </span>
                  ) : null
                }
              />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" aria-hidden />
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
            <div className="flex items-center gap-2 px-3 py-2 min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
              <span className="text-xs text-gray-500 whitespace-nowrap">预算已确认</span>
              <span className="text-[11px] text-gray-400 hidden sm:inline">提交修改说明后需再次确认</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex justify-center items-center rounded-xl bg-[#EF6B00] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#D85F00] transition-colors transition-transform active:scale-[0.99] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 min-w-[8.5rem]"
            >
              确认当前预算
            </button>
          )}
          <button
            type="button"
            onClick={() => setModifyOpen(true)}
            className="inline-flex justify-center items-center rounded-xl bg-white text-sm font-medium px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors transition-transform active:scale-[0.99] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 min-w-[8.5rem]"
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
