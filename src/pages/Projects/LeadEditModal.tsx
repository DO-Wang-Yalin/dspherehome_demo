import React, { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { leadsOptionsApi } from '../../services/designVoyage/LeadsOptionsService'
import type { LeadsOptionsResponse } from '../../services/designVoyage/LeadsOptionsService'
import {
  PROJECT_TYPES,
  AGE_GROUPS,
  BUDGET_RANGES,
  INDUSTRIES
} from '../../components/DeepEvalConstants'
import type { UserLead, LeadFormSnapshot } from '../../services/leads/savedLeadsStorage'
import { updateUserLead } from '../../services/leads/savedLeadsStorage'

function projectTypeDisplayLabel(apiValue: string): string {
  const afterPrefix = apiValue.replace(/^[HAT]_/, '')
  const firstSpace = afterPrefix.indexOf(' ')
  return firstSpace >= 0 ? afterPrefix.slice(0, firstSpace).trim() : afterPrefix.trim()
}

function budgetDisplayLabel(apiValue: string): string {
  if (!apiValue) return ''
  if (/^\d+$/.test(apiValue)) return `${apiValue}元/平方米`
  const i = apiValue.indexOf(' ')
  return i >= 0 ? apiValue.slice(i + 1).trim() : apiValue
}

const normalizePhone = (value: string) => value.replace(/[^\d-]/g, '')

export function LeadEditModal({
  lead,
  open,
  onClose,
  onSaved
}: {
  lead: UserLead | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [opts, setOpts] = useState<LeadsOptionsResponse | null>(null)
  const [form, setForm] = useState<LeadFormSnapshot | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) leadsOptionsApi.getOptions().then(setOpts).catch(() => setOpts(null))
  }, [open])

  useEffect(() => {
    if (open && lead) {
      setForm({
        projectType: lead.projectType,
        projectPosition: lead.projectPosition,
        handoverStatus: lead.handoverStatus,
        area: lead.area,
        budget: lead.budget,
        name: lead.name,
        salutation: lead.salutation,
        city: lead.city,
        phone: lead.phone,
        ageGroup: lead.ageGroup,
        industry: lead.industry,
        projectName: lead.projectName
      })
      setErr(null)
    }
  }, [open, lead])

  const projectTypeOpts = useMemo(() => {
    const raw = opts?.project_type ?? []
    const fromApi = raw
      .filter((v) => v.startsWith('H_') || v.startsWith('A_') || v.startsWith('T_'))
      .map((value) => ({ value, label: projectTypeDisplayLabel(value) }))
    if (fromApi.length) return fromApi
    return PROJECT_TYPES.map((t) => ({ value: t, label: t }))
  }, [opts])

  const budgetOptions = opts?.project_budget_range ?? BUDGET_RANGES
  const titleOptions = opts?.user_title ?? ['先生', '女士']
  const ageOptions = opts?.user_age_range ?? AGE_GROUPS
  const industryOptions = opts?.user_industry ?? INDUSTRIES

  const isDetached = Boolean(form?.projectType?.includes('独栋别墅'))
  const handoverOpts = [
    { value: '毛坯', label: '毛坯' },
    { value: '精装', label: '精装' },
    { value: '旧房', label: '旧房' },
    ...(isDetached ? [{ value: '土地', label: '土地' }] : [])
  ]

  const setField = (k: keyof LeadFormSnapshot, v: string) => {
    setForm((prev) => {
      if (!prev) return prev
      const next = { ...prev, [k]: v }
      if (k === 'projectType' && !v.includes('独栋别墅') && prev.handoverStatus === '土地') {
        next.handoverStatus = ''
      }
      return next
    })
  }

  const handleSave = () => {
    if (!lead || !form) return
    const e: string[] = []
    if (!form.projectPosition.trim()) e.push('请填写项目城市')
    if (!form.projectType) e.push('请选择项目类型')
    if (!form.handoverStatus) e.push('请选择收房状态')
    if (!form.area.trim()) e.push('请填写面积')
    if (!form.budget) e.push('请选择预算')
    if (!form.name.trim()) e.push('请填写姓名')
    if (!form.ageGroup) e.push('请选择年龄段')
    if (!form.industry) e.push('请选择行业')
    if (!form.city.trim()) e.push('请填写所在城市')
    if (!form.phone.trim()) e.push('请填写手机')
    else if (!/^\d{11}$/.test(form.phone.replace(/-/g, ''))) e.push('手机号为 11 位数字')
    if (e.length) {
      setErr(e.join('；'))
      return
    }
    setSaving(true)
    try {
      updateUserLead(lead.id, form)
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open || !lead || !form) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-4">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">编辑线索</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          {err && (
            <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-xs">{err}</div>
          )}
          <div>
            <label className="block font-medium text-gray-800 mb-1">项目名称/小区</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.projectName}
              onChange={(e) => setField('projectName', e.target.value)}
              placeholder="例如：汤臣一品"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">项目城市</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.projectPosition}
              onChange={(e) => setField('projectPosition', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">项目类型</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.projectType}
              onChange={(e) => setField('projectType', e.target.value)}
            >
              <option value="">请选择</option>
              {projectTypeOpts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">收房状态</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.handoverStatus}
              onChange={(e) => setField('handoverStatus', e.target.value)}
            >
              <option value="">请选择</option>
              {handoverOpts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">实际面积（㎡）</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.area}
              onChange={(e) => setField('area', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">每平方造价上限</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.budget}
              onChange={(e) => setField('budget', e.target.value)}
            >
              <option value="">请选择</option>
              {budgetOptions.map((b) => (
                <option key={b} value={b}>
                  {budgetDisplayLabel(b)}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-[#EF6B00] mb-2">您的信息</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block font-medium text-gray-800 mb-1">姓名</label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
            <div className="w-28">
              <label className="block font-medium text-gray-800 mb-1">称呼</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-2 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
                value={form.salutation}
                onChange={(e) => setField('salutation', e.target.value)}
              >
                {titleOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">年龄段</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.ageGroup}
              onChange={(e) => setField('ageGroup', e.target.value)}
            >
              <option value="">请选择</option>
              {ageOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">所在行业</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.industry}
              onChange={(e) => setField('industry', e.target.value)}
            >
              <option value="">请选择</option>
              {industryOptions.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">所在城市</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-800 mb-1">手机号</label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#EF6B00]/25"
              value={form.phone}
              onChange={(e) => setField('phone', normalizePhone(e.target.value))}
            />
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-5 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200/80"
          >
            取消
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#EF6B00] text-white font-medium hover:bg-[#d65f00] disabled:opacity-50"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
