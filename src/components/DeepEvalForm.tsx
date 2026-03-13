import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, CheckCircle2, ChevronDown, MapPin, Phone, Briefcase, ChevronRight, Copy, LocateFixed, Loader2, Wallet } from 'lucide-react'

import { PROJECT_TYPES, AGE_GROUPS, BUDGET_RANGES, INDUSTRIES } from './DeepEvalConstants'
import { leadsApi, buildDesignVoyageLeadPayload } from '../services/designVoyage/LeadsService'
import type { LeadsOptionsResponse } from '../services/designVoyage/LeadsOptionsService'
import type { StyleOption } from '../services/designVoyage/LeadsService'

function projectTypeDisplayLabel(apiValue: string): string {
  const afterPrefix = apiValue.replace(/^[HAT]_/, '')
  const firstSpace = afterPrefix.indexOf(' ')
  return firstSpace >= 0 ? afterPrefix.slice(0, firstSpace).trim() : afterPrefix.trim()
}

function budgetDisplayLabel(apiValue: string): string {
  const i = apiValue.indexOf(' ')
  return i >= 0 ? apiValue.slice(i + 1).trim() : apiValue
}

function getProjectTypeOptions(leadsOptions: LeadsOptionsResponse | null): { value: string; label: string }[] {
  const raw = leadsOptions?.project_type ?? []
  return raw
    .filter((v) => v.startsWith('H_') || v.startsWith('A_') || v.startsWith('T_'))
    .map((value) => ({ value, label: projectTypeDisplayLabel(value) }))
}

interface DeepEvalFormProps {
  leadsOptions?: LeadsOptionsResponse | null
  journeySummary: { currentFavorite: StyleOption | null; focusSpace: string | null }
  onBack: () => void
  onSubmit: () => void
}

const normalizePhone = (value: string) => value.replace(/[^\d-]/g, '')

const isPhoneValid = (phone: string) => /^\d{11}$/.test(phone.replace(/-/g, ''))

export const DeepEvalForm: React.FC<DeepEvalFormProps> = ({ leadsOptions, journeySummary, onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geo, setGeo] = useState<{ latitude: number; longitude: number } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const projectTypeOptions = useMemo(() => getProjectTypeOptions(leadsOptions ?? null), [leadsOptions])
  const budgetOptions = leadsOptions?.project_budget_range ?? BUDGET_RANGES
  const titleOptions = leadsOptions?.user_title ?? ['先生', '女士']
  const ageOptions = leadsOptions?.user_age_range ?? AGE_GROUPS
  const industryOptions = leadsOptions?.user_industry ?? INDUSTRIES

  const [formData, setFormData] = useState({
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
  })

  const handleChange = (field: string, value: string) => {
    const next = field === 'phone' ? normalizePhone(value) : value
    setFormData(prev => {
      const nextData = { ...prev, [field]: next }
      if (field === 'projectType' && !value.includes('独栋别墅') && prev.handoverStatus === '土地') {
        nextData.handoverStatus = ''
      }
      return nextData
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    const coords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const province = data.principalSubdivision || ''
      const city = data.city || data.locality || ''
      const address = [province, city].filter(Boolean).join(' ').trim()
      return address || coords
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
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, projectPosition: '您的浏览器不支持地理位置功能' }))
      return
    }
    setErrors(prev => ({ ...prev, projectPosition: '' }))
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setGeo({ latitude, longitude })
        try {
          const address = await reverseGeocode(latitude, longitude)
          setFormData(prev => ({ ...prev, projectPosition: address }))
        } catch (error) {
          console.error('Geocoding failed', error)
          setFormData(prev => ({ ...prev, projectPosition: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error('Geolocation error', error)
        setIsLocating(false)
        let errorMsg = '无法获取位置'
        if (error.code === 1) errorMsg = '请允许浏览器获取位置权限'
        else if (error.code === 2) errorMsg = '位置不可用'
        else if (error.code === 3) errorMsg = '获取位置超时'
        setErrors(prev => ({ ...prev, projectPosition: `${errorMsg}，请尝试手动输入` }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleCopyProjectLocation = () => {
    if (formData.projectPosition) {
      setFormData(prev => ({ ...prev, city: formData.projectPosition }))
      setErrors(prev => ({ ...prev, city: '' }))
    } else {
      setErrors(prev => ({ ...prev, projectPosition: '请先填写或获取项目城市信息' }))
    }
  }

  const validateStep = (): boolean => {
    const nextErrors: Record<string, string> = {}
    if (currentStep === 1) {
      if (!formData.projectPosition) nextErrors.projectPosition = '请填写项目城市'
      if (!formData.projectType) nextErrors.projectType = '请选择项目类型'
      if (!formData.handoverStatus) nextErrors.handoverStatus = '请选择收房状态'
      if (!formData.area) nextErrors.area = '请填写实际面积'
      if (!formData.budget) nextErrors.budget = '请选择每平方造价上限'
    }
    if (currentStep === 2) {
      if (!formData.name) nextErrors.name = '请填写您的姓名'
      if (!formData.ageGroup) nextErrors.ageGroup = '请选择年龄段'
      if (!formData.industry) nextErrors.industry = '请选择所在行业'
    }
    if (currentStep === 3) {
      if (!formData.city) nextErrors.city = '请填写所在城市'
      if (!formData.phone) nextErrors.phone = '请填写手机号'
      else if (!isPhoneValid(formData.phone)) nextErrors.phone = '请输入正确的 11 位手机号码'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    setSubmitError(null)
    if (currentStep === 1 && !validateStep()) return
    if (currentStep === 2 && !validateStep()) return
    if (currentStep === 3) {
      if (!validateStep()) return
      handleSubmit()
      return
    }
    setDirection(1)
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep === 1) {
      onBack()
    } else {
      setDirection(-1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildDesignVoyageLeadPayload(formData, {
        journeySummary,
        ...(geo != null ? { project_location: geo } : {})
      })
      await leadsApi.submitLead(payload)
      setShowSuccess(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    onSubmit()
  }

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 20 : -20, opacity: 0 })
  }
  const transition = { x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }

  const renderStepIndicator = () => (
    <div className="flex items-center gap-1.5 justify-center">
      {[1, 2, 3].map(step => (
        <div key={step} className="flex items-center gap-1.5">
          <div
            className={`rounded-full transition-all duration-300 ${currentStep >= step ? 'bg-[#FFCE42]' : 'bg-[#EF6B00]/20'}`}
            style={{ width: 10, height: 10 }}
          />
          {step < 3 && (
            <div
              className={`flex-shrink-0 transition-colors duration-300 ${currentStep > step ? 'bg-[#FFCE42]/60' : 'bg-[#EF6B00]/15'}`}
              style={{ width: 32, height: 3, borderRadius: 2 }}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="w-full h-full bg-[#FFFDF3] overflow-hidden relative font-sans text-dark flex flex-col pt-12 md:pt-20">
      <header className="shrink-0 w-full max-w-5xl px-6 mb-4 md:mb-6 relative z-50 mx-auto bg-[#FFFDF3]">
        <div className="w-full flex items-center justify-between gap-4 min-h-[44px]">
          <div className="w-10 shrink-0 flex justify-start">
            <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-dark/60 hover:bg-white transition-all active:scale-95 shadow-sm">
              <ArrowLeft size={20} />
            </button>
          </div>
          <h2 className="flex-1 min-w-0 text-xl md:text-4xl font-sans text-dark leading-tight text-center px-2">
            项目深度需求测评
          </h2>
          <div className="w-10 shrink-0 flex justify-end" />
        </div>
      </header>

      <div className="shrink-0 w-full max-w-2xl md:max-w-4xl mx-auto px-6 pt-2 pb-4 min-h-[48px] flex items-center justify-center">
        {renderStepIndicator()}
      </div>

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl mx-auto px-6 relative flex flex-col overflow-y-auto">
        <div className="relative flex-1">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="w-full pb-24">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-sans text-dark mb-2">项目概况</h1>
                  <p className="text-sm text-sub px-4 leading-relaxed">作为种子用户，你的档案会被我们保存，上线后直接同步到产品里。我们不会用它打扰你；</p>
                </div>
                <div className="bg-[#FFFDF3] p-6 md:p-10 rounded-[24px] shadow-sm border border-white space-y-6 md:space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">项目城市</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30" size={16} />
                      <input type="text" value={formData.projectPosition} onChange={(e) => handleChange('projectPosition', e.target.value)} placeholder="点击右侧按钮获取定位或手动输入" className="w-full bg-[#FFF9E8] rounded-xl pl-10 pr-12 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-dark/30" />
                      <button type="button" onClick={handleGetLocation} disabled={isLocating} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-lg text-brand shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="获取当前位置">
                        {isLocating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={16} /></motion.div> : <LocateFixed size={16} />}
                      </button>
                    </div>
                    {errors.projectPosition && <p className="text-red-500 text-xs mt-1">{errors.projectPosition}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-3">项目类型</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(projectTypeOptions.length ? projectTypeOptions : PROJECT_TYPES.map((t) => ({ value: t, label: t }))).map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleChange('projectType', value)}
                          className={`py-3 rounded-xl text-xs md:text-sm font-medium transition-all ${
                            formData.projectType === value
                              ? 'bg-[#EF6B00] text-[#F8F7FF] shadow-md shadow-[#EF6B00]/30'
                              : 'bg-[#FFF9E8] text-dark/70 hover:bg-[#E6E2DC]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {errors.projectType && <p className="text-red-500 text-xs mt-1">{errors.projectType}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-3">收房状态</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        '毛坯',
                        '精装',
                        '旧房',
                        ...(formData.projectType && formData.projectType.includes('独栋别墅') ? ['土地'] : [])
                      ].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleChange('handoverStatus', opt)}
                          className={`py-3 rounded-xl text-xs md:text-sm font-medium transition-all ${
                            formData.handoverStatus === opt
                              ? 'bg-[#EF6B00] text-[#F8F7FF] shadow-md shadow-[#EF6B00]/30'
                              : 'bg-[#FFF9E8] text-dark/70 hover:bg-[#E6E2DC]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {errors.handoverStatus && <p className="text-red-500 text-xs mt-1">{errors.handoverStatus}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">实际面积</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.area}
                        onChange={(e) => handleChange('area', e.target.value)}
                        placeholder="请输入"
                        className="w-full bg-[#FFF9E8] rounded-xl px-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-dark/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-dark/40 font-sans">m²</span>
                    </div>
                    {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">每平方造价上限</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30" size={16} />
                      <select value={formData.budget} onChange={(e) => handleChange('budget', e.target.value)} className={`w-full bg-[#FFF9E8] rounded-lg pl-10 pr-10 py-3 border border-[#d9d9d9] hover:border-brand/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors duration-200 appearance-none cursor-pointer ${formData.budget ? 'text-dark' : 'text-dark/30'}`}>
                        <option value="" disabled>请选择每平方造价上限</option>
                        {budgetOptions.map((range) => (
                          <option key={range} value={range}>{budgetDisplayLabel(range)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/30 pointer-events-none" size={16} />
                    </div>
                    {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                  </div>
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="w-full pb-24">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-sans text-dark mb-2">您的信息</h1>
                  <p className="text-sm text-sub px-4 leading-relaxed">这是一份"画像校准"。填完后，你的喜好与档案会一起被保存，后续在产品里自动续上。</p>
                </div>
                <div className="bg-[#FFFDF3] p-6 md:p-10 rounded-[24px] shadow-sm border border-white space-y-6 md:space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">姓名</label>
                      <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="怎么称呼您" className="w-full bg-[#FFF9E8] rounded-xl px-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-dark/30" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className={titleOptions.length <= 2 ? 'w-28' : 'flex-1'}>
                      <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">称呼</label>
                      {titleOptions.length <= 2 ? (
                        <div className="flex rounded-xl overflow-hidden border border-[#EAE5DE] bg-[#FFF9E8] p-0.5">
                          {titleOptions.map((t) => (
                            <button key={t} type="button" onClick={() => handleChange('salutation', t)} className={`flex-1 py-2.5 text-sm font-medium transition-all ${formData.salutation === t ? 'bg-[#EF6B00] text-[#F8F7FF] shadow-sm' : 'text-dark/70 hover:bg-[#E6E2DC]'}`}>{t}</button>
                          ))}
                        </div>
                      ) : (
                        <select value={formData.salutation} onChange={(e) => handleChange('salutation', e.target.value)} className={`w-full bg-[#FFF9E8] rounded-lg px-4 py-3 border border-[#d9d9d9] hover:border-brand/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors duration-200 appearance-none cursor-pointer ${formData.salutation ? 'text-dark' : 'text-dark/30'}`}>
                          <option value="" disabled>请选择</option>
                          {titleOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">年龄段</label>
                    <div className="relative">
                      <select value={formData.ageGroup} onChange={(e) => handleChange('ageGroup', e.target.value)} className={`w-full bg-[#FFF9E8] rounded-lg px-4 py-3 border border-[#d9d9d9] hover:border-brand/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors duration-200 appearance-none cursor-pointer ${formData.ageGroup ? 'text-dark' : 'text-dark/30'}`}>
                        <option value="" disabled>请选择</option>
                        {ageOptions.map((age) => <option key={age} value={age}>{age}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/30 pointer-events-none" size={16} />
                    </div>
                    {errors.ageGroup && <p className="text-red-500 text-xs mt-1">{errors.ageGroup}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">所在行业</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30" size={16} />
                      <select value={formData.industry} onChange={(e) => handleChange('industry', e.target.value)} className={`w-full bg-[#FFF9E8] rounded-lg pl-10 pr-10 py-3 border border-[#d9d9d9] hover:border-brand/50 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors duration-200 appearance-none cursor-pointer ${formData.industry ? 'text-dark' : 'text-dark/30'}`}>
                        <option value="" disabled>请选择行业</option>
                        {industryOptions.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/30 pointer-events-none" size={16} />
                    </div>
                    {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                  </div>
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={transition} className="w-full pb-24">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-sans text-dark mb-2">取得联系</h1>
                  <p className="text-sm text-sub">留下联系方式，我们会为你创建「种子用户档案」；</p>
                </div>
                <div className="bg-[#FFFDF3] p-6 md:p-10 rounded-[24px] shadow-sm border border-white space-y-6 md:space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">所在城市</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30" size={16} />
                      <input type="text" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="例：上海 / 杭州" className="w-full bg-[#FFF9E8] rounded-xl pl-10 pr-36 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-dark/30" />
                      <button onClick={handleCopyProjectLocation} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-brand hover:text-brand-hover font-medium flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg shadow-sm border border-brand/10 hover:border-brand/30 active:scale-95 z-10">
                        <Copy size={12} /> 与项目城市一致
                      </button>
                    </div>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sub uppercase tracking-wider mb-2">手机号（用于发送结果与确认细节）</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30" size={16} />
                      <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="11位手机号码" className="w-full bg-[#FFF9E8] rounded-xl pl-10 pr-4 py-3 text-dark focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-dark/30" />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#FFFDF3]/90 backdrop-blur-md border-t border-dark/5 p-4 z-50">
        <div className="max-w-2xl md:max-w-4xl mx-auto">
          {submitError && <p className="text-red-500 text-sm mb-2 text-center">{submitError}</p>}
          <button onClick={handleNext} disabled={isSubmitting} className="w-full bg-[#FF9C3E] text-white py-4 rounded-xl shadow-xl hover:bg-[#EF6B00] transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                提交中...
              </span>
            ) : (
              <>
                <span className="font-bold tracking-widest uppercase">{currentStep === 3 ? '提交预约' : '下一步'}</span>
                <ChevronRight size={20} className={`transition-transform duration-300 ${currentStep < 3 ? 'group-hover:translate-x-1' : 'opacity-0 w-0'}`} />
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-[#FFFDF3] rounded-[24px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand" />
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-sans text-dark mb-2">已建档 ✅</h3>
              <p className="text-sub text-sm mb-8 leading-relaxed">你的喜好会在产品上线后自动带入，直接登录就能继续。</p>
              <button type="button" onClick={handleCloseSuccess} className="w-full bg-[#EF6B00] text-white py-3 rounded-xl font-bold tracking-wider hover:bg-[#D85F00] active:bg-[#CC5A00] transition-colors">
                返回首页
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
