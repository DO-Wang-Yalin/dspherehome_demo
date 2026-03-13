import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'
import { PROJECT_TYPES, AGE_GROUPS, BUDGET_RANGES, INDUSTRIES } from './DeepEvalConstants'
import { leadsApi, buildDesignVoyageLeadPayload } from '../services/designVoyage/LeadsService'
import type { LeadsOptionsResponse } from '../services/designVoyage/LeadsOptionsService'
import { leadsOptionsApi } from '../services/designVoyage/LeadsOptionsService'

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

function getProjectTypeOptions(leadsOptions: LeadsOptionsResponse | null): { value: string; label: string }[] {
  const raw = leadsOptions?.project_type ?? []
  return raw
    .filter((v) => v.startsWith('H_') || v.startsWith('A_') || v.startsWith('T_'))
    .map((value) => ({ value, label: projectTypeDisplayLabel(value) }))
}

const normalizePhone = (value: string) => value.replace(/[^\d-]/g, '')
const isPhoneValid = (phone: string) => /^\d{11}$/.test(phone.replace(/-/g, ''))

export interface DeepEvalFormData {
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
}

const initialFormData: DeepEvalFormData = {
  projectType: '',
  projectPosition: '',
  handoverStatus: '',
  area: '',
  budget: '',
  name: '',
  salutation: '先生',
  city: '',
  phone: '',
  ageGroup: '',
  industry: ''
}

interface DeepEvalFormContextValue {
  leadsOptions: LeadsOptionsResponse | null
  formData: DeepEvalFormData
  handleChange: (field: string, value: string) => void
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  validateStep1: () => boolean
  validateStep2: () => boolean
  validateStep3: () => boolean
  isSubmitting: boolean
  submitError: string | null
  setSubmitError: (v: string | null) => void
  submit: () => Promise<void>
  showSuccess: boolean
  setShowSuccess: (v: boolean) => void
  isLocating: boolean
  setIsLocating: (v: boolean) => void
  geo: { latitude: number; longitude: number } | null
  setGeo: (v: { latitude: number; longitude: number } | null) => void
  reverseGeocode: (latitude: number, longitude: number) => Promise<string>
  handleGetLocation: () => void
  handleGetCityLocation: () => void
  handleCopyProjectLocation: () => void
  projectTypeOptions: { value: string; label: string }[]
  budgetOptions: string[]
  titleOptions: string[]
  ageOptions: string[]
  industryOptions: string[]
  budgetDisplayLabel: (apiValue: string) => string
}

const DeepEvalFormContext = createContext<DeepEvalFormContextValue | null>(null)

export function useDeepEvalForm() {
  const ctx = useContext(DeepEvalFormContext)
  if (!ctx) throw new Error('useDeepEvalForm must be used within DeepEvalFormProvider')
  return ctx
}

export function DeepEvalFormProvider({ children }: { children: React.ReactNode }) {
  const [leadsOptions, setLeadsOptions] = useState<LeadsOptionsResponse | null>(null)
  const [formData, setFormData] = useState<DeepEvalFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [geo, setGeo] = useState<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    leadsOptionsApi.getOptions().then(setLeadsOptions).catch(() => setLeadsOptions(null))
  }, [])

  const handleChange = useCallback((field: string, value: string) => {
    const next = field === 'phone' ? normalizePhone(value) : value
    setFormData((prev) => {
      const nextData = { ...prev, [field]: next }
      if (field === 'projectType' && !value.includes('独栋别墅') && prev.handoverStatus === '土地') {
        nextData.handoverStatus = ''
      }
      return nextData
    })
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
  }, [])

  const reverseGeocode = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    const coords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const province = data.principalSubdivision || ''
      const city = data.city || data.locality || ''
      return [province, city].filter(Boolean).join(' ').trim() || coords
    } catch {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=zh-CN`,
          { headers: { 'User-Agent': 'DreamOneDesignVoyage/1.0 (https://dreamone.ai)' } }
        )
        if (!res.ok) return coords
        const data = await res.json()
        if (data?.address) {
          const city = data.address.city || data.address.town || data.address.county || ''
          const district = data.address.district || ''
          return `${city}${district}`.trim() || coords
        }
      } catch {
        // ignore
      }
      return coords
    }
  }, [])

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, projectPosition: '您的浏览器不支持地理位置功能' }))
      return
    }
    setErrors((prev) => ({ ...prev, projectPosition: '' }))
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setGeo({ latitude, longitude })
        try {
          const address = await reverseGeocode(latitude, longitude)
          setFormData((prev) => ({ ...prev, projectPosition: address }))
        } catch {
          setFormData((prev) => ({ ...prev, projectPosition: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        let errorMsg = '无法获取位置'
        if (error.code === 1) errorMsg = '请允许浏览器获取位置权限'
        else if (error.code === 2) errorMsg = '位置不可用'
        else if (error.code === 3) errorMsg = '获取位置超时'
        setErrors((prev) => ({ ...prev, projectPosition: `${errorMsg}，请尝试手动输入` }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [reverseGeocode])

  const handleGetCityLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, city: '您的浏览器不支持地理位置功能' }))
      return
    }
    setErrors((prev) => ({ ...prev, city: '' }))
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setGeo({ latitude, longitude })
        try {
          const address = await reverseGeocode(latitude, longitude)
          setFormData((prev) => ({ ...prev, city: address }))
        } catch {
          setFormData((prev) => ({ ...prev, city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        let errorMsg = '无法获取位置'
        if (error.code === 1) errorMsg = '请允许浏览器获取位置权限'
        else if (error.code === 2) errorMsg = '位置不可用'
        else if (error.code === 3) errorMsg = '获取位置超时'
        setErrors((prev) => ({ ...prev, city: `${errorMsg}，请尝试手动输入` }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [reverseGeocode])

  const handleCopyProjectLocation = useCallback(() => {
    if (formData.projectPosition) {
      setFormData((prev) => ({ ...prev, city: formData.projectPosition }))
      setErrors((prev) => ({ ...prev, city: '' }))
    } else {
      setErrors((prev) => ({ ...prev, projectPosition: '请先填写或获取项目城市信息' }))
    }
  }, [formData.projectPosition])

  const validateStep1 = useCallback((): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!formData.projectPosition) nextErrors.projectPosition = '请填写项目城市'
    if (!formData.projectType) nextErrors.projectType = '请选择项目类型'
    if (!formData.handoverStatus) nextErrors.handoverStatus = '请选择收房状态'
    if (!formData.area) nextErrors.area = '请填写实际面积'
    if (!formData.budget) nextErrors.budget = '请选择每平方造价上限'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [formData.projectPosition, formData.projectType, formData.handoverStatus, formData.area, formData.budget])

  const validateStep2 = useCallback((): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!formData.name) nextErrors.name = '请填写您的姓名'
    if (!formData.ageGroup) nextErrors.ageGroup = '请选择年龄段'
    if (!formData.industry) nextErrors.industry = '请选择所在行业'
    if (!formData.city) nextErrors.city = '请填写所在城市'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [formData.name, formData.ageGroup, formData.industry, formData.city])

  const validateStep3 = useCallback((): boolean => {
    const nextErrors: Record<string, string> = {}
    if (!formData.city) nextErrors.city = '请填写所在城市'
    if (!formData.phone) nextErrors.phone = '请填写手机号'
    else if (!isPhoneValid(formData.phone)) nextErrors.phone = '请输入正确的 11 位手机号码'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [formData.city, formData.phone])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildDesignVoyageLeadPayload(formData, {
        journeySummary: { currentFavorite: null, focusSpace: null },
        ...(geo != null ? { project_location: geo } : {})
      })
      await leadsApi.submitLead(payload)
      setShowSuccess(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, geo])

  const projectTypeOptions = useMemo(() => getProjectTypeOptions(leadsOptions), [leadsOptions])
  const budgetOptions = leadsOptions?.project_budget_range ?? BUDGET_RANGES
  const titleOptions = leadsOptions?.user_title ?? ['先生', '女士']
  const ageOptions = leadsOptions?.user_age_range ?? AGE_GROUPS
  const industryOptions = leadsOptions?.user_industry ?? INDUSTRIES

  const value: DeepEvalFormContextValue = useMemo(
    () => ({
      leadsOptions,
      formData,
      handleChange,
      errors,
      setErrors,
      validateStep1,
      validateStep2,
      validateStep3,
      isSubmitting,
      submitError,
      setSubmitError,
      submit,
      showSuccess,
      setShowSuccess,
      isLocating,
      setIsLocating,
      geo,
      setGeo,
      reverseGeocode,
      handleGetLocation,
      handleGetCityLocation,
      handleCopyProjectLocation,
      projectTypeOptions,
      budgetOptions,
      titleOptions,
      ageOptions,
      industryOptions,
      budgetDisplayLabel
    }),
    [
      leadsOptions,
      formData,
      handleChange,
      errors,
      validateStep1,
      validateStep2,
      validateStep3,
      isSubmitting,
      submitError,
      submit,
      showSuccess,
      isLocating,
      geo,
      reverseGeocode,
      handleGetLocation,
      handleGetCityLocation,
      handleCopyProjectLocation,
      projectTypeOptions,
      budgetOptions,
      titleOptions,
      ageOptions,
      industryOptions
    ]
  )

  return <DeepEvalFormContext.Provider value={value}>{children}</DeepEvalFormContext.Provider>
}

/** 提交成功弹窗 */
export function DeepEvalSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] rounded-[24px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand" />
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-sans text-dark mb-2">已建档 ✅</h3>
        <p className="text-sub text-sm mb-8 leading-relaxed">你的喜好会在产品上线后自动带入，直接登录就能继续。</p>
        <button type="button" onClick={onClose} className="w-full bg-[#FF9C3E] text-white py-3 rounded-xl font-bold tracking-wider hover:bg-[#EF6B00] active:bg-[#CC5B00] transition-colors">
          继续
        </button>
      </div>
    </div>
  )
}
