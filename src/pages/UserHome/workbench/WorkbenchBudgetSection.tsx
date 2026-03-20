import React from 'react'
import { BudgetConfirmPanel } from '../../../components/BudgetConfirmPanel'

export function WorkbenchBudgetSection({
  isBudgetConfirmed,
  confirmedAt,
}: {
  isBudgetConfirmed: boolean
  confirmedAt?: string
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1 h-4 rounded-full bg-[#EF6B00] shrink-0" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">预算资金</h2>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border shrink-0 ${
            isBudgetConfirmed
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {isBudgetConfirmed ? '已确认' : '未确认'}
        </span>
        {isBudgetConfirmed && confirmedAt ? (
          <span className="text-xs text-gray-400 w-full sm:w-auto sm:ml-0">
            确认于 {new Date(confirmedAt).toLocaleString('zh-CN')}
          </span>
        ) : null}
      </div>
      <BudgetConfirmPanel />
    </div>
  )
}
