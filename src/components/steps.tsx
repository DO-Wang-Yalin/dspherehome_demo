import React, { useState, useMemo, useRef, useCallback } from 'react';
import { domToPng } from 'modern-screenshot';
import { FormData } from '../types';
import { StepWrapper, TextInput, RadioCard, CheckboxCard, SegmentedRadio, IconRadioCard, SquareRadioCard, SquareCheckboxCard, Counter, SubQuestion } from './ui';
import { useDeepEvalForm } from './DeepEvalFormContext';
import { PROJECT_TYPES } from './DeepEvalConstants';
import { sendSmsCode, registerWithCode } from '../services/auth';
import { motion } from 'motion/react';
import {
  Check, MapPin, Target, FileText, Sun, CloudSun, Cloud, Moon, Maximize, Square, Minimize,
  Wind, Fan, CloudRain, VolumeX, Volume1, Volume2, VolumeX as VolumeMute,
  Wifi, Zap, Lightbulb, Music, ShieldCheck, Cpu, AirVent, Droplets, Thermometer,
  Lock, Waves, Trash2, Bath, Flame, Bot, Palette, Archive,
  Phone, Briefcase, ChevronDown, Copy, LocateFixed, Loader2, ChevronRight, Wallet, Home, Download, X,
} from 'lucide-react';
// @ts-ignore: static image asset import
import contractFlowImg from '../assets/contract-flow.png';
import { HomeStyleEval } from '../pages/StyleEval/HomeStyleEval';

interface StepProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  nextStep: () => void;
  goToStep?: (stepId: string) => void;
  goToWorkbench?: () => void;
  goToLogin?: () => void;
}

type HouseType = '新房' | '二手房' | '老房翻新' | string;

const getHouseConditionOptions = (houseType: HouseType): string[] => {
  if (houseType === '新房') return ['毛坯', '精装'];
  if (houseType === '老房翻新') return ['精装', '老旧装修'];
  // 二手房（以及未选择时的默认兜底）
  return ['毛坯', '精装', '老旧装修'];
};

const updateHouseTypeWithConditionGuard = (
  updateData: (fields: Partial<FormData>) => void,
  nextHouseType: HouseType,
  currentHouseCondition: string | undefined
) => {
  const allowed = getHouseConditionOptions(nextHouseType);
  const nextCondition = currentHouseCondition && allowed.includes(currentHouseCondition) ? currentHouseCondition : '';
  updateData({ houseType: nextHouseType, houseCondition: nextCondition });
};

export const StepWelcome = ({ nextStep, goToStep, goToWorkbench, goToLogin }: StepProps) => (
  <StepWrapper noCard>
    <div className="flex flex-col items-center justify-center py-10 min-h-[70vh]">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* 家居风格测评卡片（左上） */}
        <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-5 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EF6B00]/5 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF6B00]" />
              <span className="text-xs font-semibold text-[#EF6B00] tracking-wide">家居风格</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-gray-900">家居风格测评</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                快速测出你的风格倾向与氛围偏好，辅助选品与方案沟通对齐。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep?.('home-style-eval')}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            开始风格测评
          </button>
        </div>

        {/* 线索收集卡片：进入 DE-1 项目概况 */}
        <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-5 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EF6B00]/5 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF6B00]" />
              <span className="text-xs font-semibold text-[#EF6B00] tracking-wide">项目线索</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-gray-900">线索收集</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                填写项目城市、类型、面积与预算等概况，快速留下线索，便于后续跟进与方案沟通。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep?.('deep-eval-1')}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            去填写项目概况
          </button>
        </div>

        {/* 注册卡片（右上） */}
        <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-5 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EF6B00]/5 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF6B00]" />
              <span className="text-xs font-semibold text-[#EF6B00] tracking-wide">用户注册</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-gray-900">注册 / 登录</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                先完成基础信息注册，方便后续为你生成专属项目档案，并同步到正式产品中。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep?.('register')}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            去注册并填写信息
          </button>
        </div>

        {/* 深度定制之旅卡片（左下） */}
        <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-5 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EF6B00]/5 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF6B00]" />
              <span className="text-xs font-semibold text-[#EF6B00] tracking-wide">深度定制之旅</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-gray-900">一键开启深度定制</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                直接进入深度定制测评流程，逐步回答关于生活方式与空间需求的问题，体验完整定制旅程。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep?.('q2-4')}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            开启深度定制之旅
          </button>
        </div>

        {/* 进入我的首页卡片（右下） */}
        <div className="rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-5 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFCE42]/10 px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCE42]" />
              <span className="text-xs font-semibold text-[#C87800] tracking-wide">我的首页</span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-gray-900">进入我的首页</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                查看项目概览、需求书与订单等信息，作为后续交付与沟通的工作台入口。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (goToLogin ?? goToWorkbench)?.()}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            进入我的首页
          </button>
        </div>

      </div>
    </div>
  </StepWrapper>
);

export const StepHomeStyleEval = ({
  goToStep,
  styleEvalSubPage,
  onStyleEvalSubPageChange,
}: StepProps & { styleEvalSubPage?: number; onStyleEvalSubPageChange?: (n: number) => void }) => (
  <StepWrapper noCard>
    <HomeStyleEval
      onGoDeepEval={() => goToStep?.('deep-eval-1')}
      onGoHome={() => goToStep?.('welcome')}
      controlledPageIndex={styleEvalSubPage}
      onPageChange={onStyleEvalSubPageChange}
    />
  </StepWrapper>
);

/** 注册页：手机号 + 验证码，放在欢迎页之后、DE-2 之前 */
export const StepRegister = ({ data, updateData, nextStep }: StepProps) => {
  const [phone, setPhone] = useState(data.userPhone || '');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const phoneValid = /^1\d{10}$/.test(phone);
  const codeValid = /^\d{6}$/.test(code);
  // 测试模式：先允许流程跑通，后续接上真实验证码/注册接口后可关闭
  const mockRegisterEnabled = !!import.meta.env.DEV;

  const handleSendCode = async () => {
    if (!phoneValid) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    setError('');
    setSending(true);
    try {
      const result = await sendSmsCode(phone);
      if (!result.success) {
        if (!mockRegisterEnabled) {
          setError(result.message || '发送验证码失败');
          return;
        }
        // mock 模式下允许继续倒计时（不阻断流程）
        setError(result.message || '发送验证码失败（测试模式可继续）');
      }
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    setError('');
    if (!phoneValid) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (!codeValid && !mockRegisterEnabled) {
      setError('请输入 6 位验证码');
      return;
    }
    if (!codeValid && mockRegisterEnabled) {
      // mock 模式下不校验验证码，先放行
      updateData({ userPhone: phone });
      nextStep();
      return;
    }
    setSubmitting(true);
    try {
      const result = await registerWithCode(phone, code);
      if (!result.success) {
        if (!mockRegisterEnabled) {
          setError(result.message || '验证失败，请检查验证码');
          return;
        }
        // mock 模式：接口失败也放行，避免阻塞演示流程
        setError(result.message || '验证失败（测试模式已放行）');
      }
      updateData({ userPhone: phone });
      nextStep();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepWrapper noCard>
      <div className="flex flex-col items-center py-8 min-h-[60vh]">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-6 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EF6B00]/5 px-3 py-1 mb-2">
            <Phone className="w-3.5 h-3.5 text-[#EF6B00]" />
            <span className="text-xs font-semibold text-[#EF6B00] tracking-wide">手机号注册</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">填写手机号并完成验证</h2>
          <p className="text-sm text-gray-500">我们将向该手机号发送验证码，用于完成注册。</p>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-800">手机号</label>
            <div className="relative flex items-center">
              <Phone size={18} className="absolute left-4 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入 11 位手机号"
                className="w-full py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#EF6B00]/20 outline-none pl-11 pr-5 text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-800">验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入 6 位验证码"
                className="flex-1 py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#EF6B00]/20 outline-none px-5 text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending || countdown > 0 || !phoneValid}
                className="shrink-0 px-4 py-4 rounded-xl bg-[#FFF9E8] text-gray-700 text-sm font-medium hover:bg-[#F5F0E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s 后重发` : sending ? '发送中…' : '获取验证码'}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!phoneValid || (!mockRegisterEnabled && !codeValid) || submitting}
            className="w-full mt-2 flex items-center justify-center rounded-xl bg-[#FF9C3E] px-4 py-4 text-sm font-medium text-white hover:bg-[#EF6B00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.99]"
          >
            {submitting ? '验证中…' : '完成注册并继续'}
          </button>
        </div>
      </div>
    </StepWrapper>
  );
};

/** 深度测评-1：项目概况（独立步骤，目录显示「深度测评-1 项目概况」）— 设计对齐 Q2-1 */
export const StepDeepEval1 = ({ data, updateData, nextStep, prevStep }: StepProps & { prevStep?: () => void }) => {
  const ctx = useDeepEvalForm();
  const { formData, handleChange, errors, validateStep1, projectTypeOptions, budgetOptions, budgetDisplayLabel, isLocating, handleGetLocation } = ctx;

  const handleNext = () => {
    if (!String(data.projectName ?? '').trim()) {
      ctx.setErrors((prev) => ({ ...prev, projectName: '请填写项目名称/小区' }));
      return;
    }
    if (!validateStep1()) return;
    nextStep();
  };

  const projectTypeOpts = projectTypeOptions.length ? projectTypeOptions : PROJECT_TYPES.map((t) => ({ value: t, label: t }));

  const isDetachedVilla = Boolean(formData.projectType && formData.projectType.includes('独栋别墅'));
  const handoverStatusOptions = [
    { value: '毛坯', label: '毛坯' },
    { value: '精装', label: '精装' },
    { value: '旧房', label: '旧房' },
    ...(isDetachedVilla ? [{ value: '土地', label: '土地' }] : [])
  ];

  return (
    <StepWrapper title="项目概况" subtitle="作为种子用户，你的档案会被我们保存，上线后直接同步到产品里。我们不会用它打扰你；">
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-800">项目城市</label>
          <div className="relative flex items-center">
            <MapPin size={18} className="absolute left-4 text-gray-400" />
            <input
              type="text"
              value={formData.projectPosition}
              onChange={(e) => handleChange('projectPosition', e.target.value)}
              placeholder="点击右侧按钮获取定位或手动输入..."
              className="w-full py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#EF6B00]/20 outline-none transition-all text-gray-800 pl-11 pr-12 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="absolute right-4 p-1 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              title="获取当前位置"
            >
              {isLocating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={18} className="text-gray-600" /></motion.div> : <Target size={18} className="text-gray-600" />}
            </button>
          </div>
          {errors.projectPosition && <p className="text-red-500 text-xs mt-1">{errors.projectPosition}</p>}
        </div>

        <TextInput
          label="项目名称/小区"
          value={data.projectName}
          onChange={(v: string) => {
            updateData({ projectName: v });
            if (errors.projectName) ctx.setErrors((prev) => ({ ...prev, projectName: '' }));
          }}
          placeholder="例如: 汤臣一品"
        />
        {errors.projectName && <p className="text-red-500 text-xs mt-1 -mt-2">{errors.projectName}</p>}

        <SegmentedRadio
          label="项目类型"
          value={formData.projectType}
          onChange={(v: string) => handleChange('projectType', v)}
          options={projectTypeOpts}
        />
        {errors.projectType && <p className="text-red-500 text-xs mt-1 -mt-2">{errors.projectType}</p>}

        <SegmentedRadio
          label="收房状态"
          value={formData.handoverStatus}
          onChange={(v: string) => handleChange('handoverStatus', v)}
          options={handoverStatusOptions}
        />
        {errors.handoverStatus && <p className="text-red-500 text-xs mt-1 -mt-2">{errors.handoverStatus}</p>}

        <TextInput
          label="实际面积"
          type="number"
          value={formData.area}
          onChange={(v: string) => handleChange('area', v)}
          placeholder="请输入..."
          suffix="m²"
        />
        {errors.area && <p className="text-red-500 text-xs mt-1 -mt-2">{errors.area}</p>}

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-800">每平方造价上限</label>
          <div className="relative flex items-center">
            <Wallet size={18} className="absolute left-4 text-gray-400" />
            <select
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              className={`w-full py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#EF6B00]/20 outline-none transition-all text-gray-800 pl-11 pr-10 appearance-none cursor-pointer ${formData.budget ? '' : 'text-gray-400'}`}
            >
              <option value="" disabled>请选择每平方造价上限</option>
              {budgetOptions.map((range) => (
                <option key={range} value={range}>{budgetDisplayLabel(range)}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 text-gray-500 pointer-events-none" />
          </div>
          {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
          {formData.area && formData.budget && (() => {
            const areaNum = Math.max(0, parseFloat(formData.area) || 0);
            const yuanPerSqm = Number(formData.budget) || 0;
            const totalYuan = areaNum * yuanPerSqm;
            if (areaNum <= 0 || yuanPerSqm <= 0) return null;
            const totalStr = totalYuan >= 10000 ? `${(totalYuan / 10000).toFixed(1)}万元` : `${Math.round(totalYuan).toLocaleString()}元`;
            return (
              <p className="text-sm text-gray-700 mt-1 font-medium">
                总造价：{areaNum}㎡ × {budgetDisplayLabel(formData.budget)} = {totalStr}
              </p>
            );
          })()}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-[#FF9C3E] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#EF6B00] transition-colors active:scale-[0.99] mt-2"
        >
          下一步
          <ChevronRight size={18} />
        </button>
      </div>
    </StepWrapper>
  );
};

/** 深度测评-2：您的信息（独立步骤，目录显示「深度测评-2 您的信息」）— 页面设计对齐 Q2-0 */
export const StepDeepEval2 = ({ nextStep, prevStep }: StepProps & { prevStep?: () => void }) => {
  const ctx = useDeepEvalForm();
  const { formData, handleChange, errors, validateStep2, titleOptions, ageOptions, industryOptions, isLocating, handleGetCityLocation } = ctx;

  const handleNext = () => {
    if (!validateStep2()) return;
    nextStep();
  };

  return (
    <StepWrapper title="您的信息" subtitle="这是一份「画像校准」。填完后，你的喜好与档案会一起被保存，后续在产品里自动续上。">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 sm:items-end">
          <div className="flex-1 min-w-0">
            <TextInput
              label="姓名"
              value={formData.name}
              onChange={(v: string) => handleChange('name', v)}
              placeholder="怎么称呼您"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="sm:w-28 flex-shrink-0">
            <label className="text-sm font-bold text-gray-800 block mb-3">称呼</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-[#FFFDF3] p-0.5">
              {(titleOptions.length ? titleOptions : ['先生', '女士']).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange('salutation', t)}
                  className={`flex-1 min-w-0 py-3.5 px-2 text-sm font-medium transition-all rounded-lg ${
                    formData.salutation === t
                      ? 'bg-[#FFFDF3] border-[#EF6B00] text-[#EF6B00] border shadow-sm'
                      : 'text-gray-600 hover:bg-[#FFF9E8] border border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            年龄段
          </SubQuestion>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(ageOptions.length ? ageOptions : ['20-30岁', '31-40岁', '41-50岁', '50岁以上']).map((opt) => (
              <SquareRadioCard
                key={opt}
                label={opt}
                selected={formData.ageGroup === opt}
                onClick={() => handleChange('ageGroup', opt)}
                compact
              />
            ))}
          </div>
          {errors.ageGroup && <p className="text-red-500 text-xs mt-1">{errors.ageGroup}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-800">所在城市</label>
          <div className="relative flex items-center">
            <MapPin size={18} className="absolute left-4 text-gray-400" />
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="点击右侧按钮获取定位或手动输入"
              className="w-full py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#EF6B00]/20 outline-none transition-all text-gray-800 pl-11 pr-12 placeholder:text-gray-400"
            />
            <button type="button" onClick={handleGetCityLocation} disabled={isLocating} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-lg text-[#EF6B00] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 border border-[#EF6B00]/20" title="获取当前位置">
              {isLocating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 size={16} /></motion.div> : <LocateFixed size={16} />}
            </button>
          </div>
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-800">所在行业</label>
          <div className="relative flex items-center">
            <Briefcase size={18} className="absolute left-4 text-gray-400" />
            <select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className={`w-full py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#EF6B00]/20 outline-none transition-all text-gray-800 pl-11 pr-10 appearance-none cursor-pointer ${formData.industry ? '' : 'text-gray-400'}`}
            >
              <option value="">请选择行业</option>
              {industryOptions.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 text-gray-500 pointer-events-none" />
          </div>
          {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-[#FF9C3E] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#EF6B00] transition-colors active:scale-[0.99] mt-2"
        >
          下一步
          <ChevronRight size={18} />
        </button>
      </div>
    </StepWrapper>
  );
};

/** 将线索收集的预算选项解析为每平方米造价（元）。支持纯数字如 "5000" 或旧格式 "1_ 20,000元/平方米以上" */
function parseBudgetRangeToYuanPerSqm(budgetRange: string): number {
  if (/^\d+$/.test(budgetRange)) return Number(budgetRange)
  const raw = budgetRange.replace(/,/g, '')
  const numbers = raw.match(/\d+/g)?.map(Number) ?? []
  if (numbers.length === 0) return 0
  if (raw.includes('以上') && numbers.length >= 1) return numbers[0]
  if (numbers.length >= 2) return Math.round((numbers[0] + numbers[1]) / 2)
  return numbers[0]
}

/** E 高端设计 / P 严选精品 / C 匠心施工 占比（设计约 10%、货品约 55%，后续与数据端打通由算法产出） */
const BUDGET_EPC_RATIOS = { E: 0.1, P: 0.55, C: 0.35 } as const

/** 预算拆解 E/P/C 配色：现代奢华感 — 冷灰 / 深岩灰 / 铜橙色 */
const EPC_THEME = {
  E: {
    color: '#718096', /* 冷灰色，精致中性 */
    light: 'rgba(113,128,150,0.12)',
    name: '高端设计',
    desc: '专业设计方案与效果呈现',
  },
  P: {
    color: '#2D3748', /* 深岩灰，沉稳厚重 */
    light: 'rgba(45,55,72,0.12)',
    name: '严选精品',
    desc: '优质主材与精选软装',
  },
  C: {
    color: '#C05621', /* 铜橙色，高级活力 */
    light: 'rgba(192,86,33,0.12)',
    name: '匠心施工',
    desc: '专业施工与品质保障',
  },
} as const

const isWeChat = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)

/** 项目预算拆解：基于线索收集的面积与预算拆解为 E/P/C，支持保存到本地 */
export const StepBudgetBreakdown = ({ nextStep, prevStep }: StepProps & { prevStep?: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saveCardError, setSaveCardError] = useState<string | null>(null)
  const [isSavingCard, setIsSavingCard] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const ctx = useDeepEvalForm()
  const { formData, budgetDisplayLabel, submit, isSubmitting, submitError, setSubmitError } = ctx
  const areaNum = Math.max(0, parseFloat(formData.area) || 0)
  const yuanPerSqm = parseBudgetRangeToYuanPerSqm(formData.budget)
  const totalYuan = areaNum * yuanPerSqm

  const segments = (() => {
    const E = totalYuan * BUDGET_EPC_RATIOS.E
    const P = totalYuan * BUDGET_EPC_RATIOS.P
    const C = totalYuan * BUDGET_EPC_RATIOS.C
    return [
      { id: 'E' as const, amount: E, ratio: BUDGET_EPC_RATIOS.E, ...EPC_THEME.E },
      { id: 'P' as const, amount: P, ratio: BUDGET_EPC_RATIOS.P, ...EPC_THEME.P },
      { id: 'C' as const, amount: C, ratio: BUDGET_EPC_RATIOS.C, ...EPC_THEME.C },
    ]
  })()

  /** 设计参考：金额展示为 ¥xxx,xxx.00 */
  const formatYuan = (yuan: number) =>
    `¥${(Math.round(yuan * 100) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatPerSqmYuan = (yuan: number) =>
    areaNum > 0 ? formatYuan(yuan / areaNum) : '—'

  const cx = 100
  const cy = 100
  const R = 88
  const rInner = 52
  const rLabel = (rInner + R) / 2
  const rad = (deg: number) => (deg - 90) * (Math.PI / 180)
  let cumulative = 0
  const donutPaths = segments.map((s) => {
    const startAngle = cumulative * 360
    cumulative += s.ratio
    const endAngle = cumulative * 360
    const midAngle = (startAngle + endAngle) / 2
    const labelX = cx + rLabel * Math.cos(rad(midAngle))
    const labelY = cy + rLabel * Math.sin(rad(midAngle))
    const x1o = cx + R * Math.cos(rad(startAngle))
    const y1o = cy + R * Math.sin(rad(startAngle))
    const x2o = cx + R * Math.cos(rad(endAngle))
    const y2o = cy + R * Math.sin(rad(endAngle))
    const x1i = cx + rInner * Math.cos(rad(startAngle))
    const y1i = cy + rInner * Math.sin(rad(startAngle))
    const x2i = cx + rInner * Math.cos(rad(endAngle))
    const y2i = cy + rInner * Math.sin(rad(endAngle))
    const large = endAngle - startAngle > 180 ? 1 : 0
    const d = `M ${x1o} ${y1o} A ${R} ${R} 0 ${large} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 ${large} 0 ${x1i} ${y1i} Z`
    return { ...s, d, labelX, labelY, pct: Math.round(s.ratio * 100) }
  })

  const hasData = areaNum > 0 && yuanPerSqm > 0
  const cardNo = useMemo(() => `BD-${String(Math.floor(10000 + Math.random() * 90000))}`, [])

  const handleSaveCard = useCallback(async () => {
    if (!cardRef.current) return
    setSaveCardError(null)
    setIsSavingCard(true)
    try {
      const dataUrl = await domToPng(cardRef.current, { scale: 2, quality: 1 })
      if (isWeChat) {
        setPreviewImageUrl(dataUrl)
      } else {
        const link = document.createElement('a')
        link.download = `项目预算拆解_${new Date().toISOString().slice(0, 10)}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('保存图片失败:', err)
      setSaveCardError('保存失败，请重试')
    } finally {
      setIsSavingCard(false)
    }
  }, [])

  const closePreview = useCallback(() => setPreviewImageUrl(null), [])

  return (
    <StepWrapper noCard title="项目预算拆解" subtitle="基于您在「线索收集」中填写的面积与预算，拆解为设计、严选、施工三块。">
      <div className="space-y-6">
        {hasData ? (
          <>
            {/* 独立卡片：与风格测评结果页一致的视觉语言，顶部品牌色装饰条 */}
            <div ref={cardRef} className="w-full max-w-md mx-auto bg-[#FDFBF7] rounded-[24px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-[#EF6B00] via-[#FF9C3E] to-[#FFCE42]" aria-hidden />
              <div className="p-6 sm:p-8 space-y-6">
                {/* 1. 预算分布 */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">预算分布</h3>
                  <div className="flex flex-col items-center gap-4">
                    <figure className="relative flex flex-col items-center">
                      <svg
                        width={200}
                        height={200}
                        viewBox="0 0 200 200"
                        className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]"
                        aria-hidden
                      >
                        {donutPaths.map((p) => (
                          <path
                            key={p.id}
                            d={p.d}
                            fill={p.color}
                            stroke="#ffffff"
                            strokeWidth={2.5}
                          />
                        ))}
                        {donutPaths.map((p) => (
                          <text
                            key={`label-${p.id}`}
                            x={p.labelX}
                            y={p.labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontWeight="600"
                            style={{
                              fontSize: '11px',
                              filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.35))',
                            }}
                          >
                            {p.pct}%
                          </text>
                        ))}
                      </svg>
                    </figure>
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                      {segments.map((s) => (
                        <div key={s.id} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-sm text-gray-700">{s.id} {s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. 预算明细 */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-900">预算明细</h3>
                  <div className="space-y-3">
                    {segments.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex"
                      >
                        <div
                          className="w-1.5 flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <div className="flex-1 p-4 relative">
                          <span className="absolute top-4 right-4 text-sm font-semibold text-gray-900 tabular-nums">
                            {Math.round(s.ratio * 100)}%
                          </span>
                          <h4 className="text-base font-semibold text-gray-900 pr-10">
                            {s.id} {s.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                            {s.id !== 'P' && (
                              <span>单平方米造价：{formatPerSqmYuan(s.amount)}</span>
                            )}
                            <span>总价：{formatYuan(s.amount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. 项目总预算 */}
                <div className="rounded-xl bg-[#F7F5F0] border border-[#EAE5DE] px-4 py-4 flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900">项目总预算</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 tabular-nums">
                    {formatYuan(totalYuan)}
                  </p>
                </div>

                {/* 卡片编号：便于后续追踪与引用 */}
                <div className="pt-4 flex justify-end border-t border-black/5">
                  <span className="text-[10px] font-mono text-gray-400 tracking-wider" title="卡片编号，用于追踪与引用">
                    NO.{cardNo}
                  </span>
                </div>
              </div>
            </div>

            {/* 底部操作区：保存卡片到本地 + 继续注册 */}
            <div className="w-full max-w-md mx-auto flex flex-col gap-3">
              {saveCardError && (
                <p className="text-sm text-red-500 text-center">{saveCardError}</p>
              )}
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={isSavingCard}
                className="w-full bg-[#2C2825] text-[#F4F1EA] py-3.5 px-5 rounded-xl shadow-lg hover:bg-black transition-all active:scale-[0.99] flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-sm tracking-widest uppercase">
                    {isSavingCard ? '保存中…' : '保存我的预算'}
                  </span>
                  <span className="text-[9px] text-white/50 font-light mt-0.5">可分享给家人或设计师</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Download size={14} />
                </div>
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-[#EF6B00] text-white py-4 px-5 rounded-xl shadow-lg shadow-[#EF6B00]/20 hover:bg-[#D85F00] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold text-sm"
              >
                继续注册获取更多信息
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-white/60 border border-gray-100 py-10 px-6 text-center shadow-sm max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                请先在「线索收集」中填写实际面积与每平方造价上限，即可在此查看 E 高端设计、P 严选精品、C 匠心施工 的预算拆解。
              </p>
            </div>
            <div className="w-full max-w-md mx-auto">
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-[#EF6B00] text-white py-4 px-5 rounded-xl shadow-lg hover:bg-[#D85F00] flex items-center justify-center gap-2 font-bold text-sm transition-colors active:scale-[0.99]"
              >
                继续注册获取更多信息
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </StepWrapper>
  );
};

export const Step1 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="项目概况" subtitle="作为种子用户，你的档案会被我们保存，上线后直接同步到产品里。我们不会用它打扰你；">
    <div className="space-y-6">
      <SegmentedRadio 
        label="项目类型" 
        value={data.projectType} 
        onChange={(v: string) => updateData({ projectType: v })}
        options={['独栋别墅', '平层公寓', '复式联排']} 
      />
      <TextInput 
        label="项目城市" 
        value={data.projectLocation} 
        onChange={(v: string) => updateData({ projectLocation: v })} 
        placeholder="点击右侧按钮获取定位或手动输入..." 
        icon={MapPin}
        suffixIcon={Target}
      />
      <TextInput 
        label="实际面积" 
        type="number" 
        value={data.projectArea} 
        onChange={(v: string) => updateData({ projectArea: v })} 
        placeholder="请输入..." 
        suffix="m²" 
      />
      <div className="space-y-3">
        <SubQuestion className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          每平方米项目造价
        </SubQuestion>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'A', label: '精工全案高定 (5,000 - 8,000)' },
            { value: 'B', label: '豪华奢享方案 (8,000 - 12,000)' },
            { value: 'C', label: '顶奢私享空间 (12,000 - 20,000)' },
            { value: 'D', label: '艺术殿堂级定制 (20,000 以上)' },
            { value: 'E', label: '了解更多高性价比方案' }
          ].map(opt => (
            <RadioCard
              key={opt.value}
              label={opt.label}
              selected={data.budgetStandard === opt.value}
              onClick={() => updateData({ budgetStandard: opt.value })}
            />
          ))}
        </div>
      </div>
    </div>
  </StepWrapper>
);

export const Step2 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="房屋现状" subtitle="了解房屋的基本情况">
    <div className="space-y-6">
      <TextInput label="项目名称/小区" value={data.projectName} onChange={(v: string) => updateData({ projectName: v })} placeholder="例如: 汤臣一品" />
      <SegmentedRadio 
        label="房屋类型" 
        value={data.houseType} 
        onChange={(v: string) => updateHouseTypeWithConditionGuard(updateData, v, data.houseCondition)}
        options={['新房', '二手房', '老房翻新']} 
      />
      <SegmentedRadio 
        label="房屋现状" 
        value={data.houseCondition} 
        onChange={(v: string) => updateData({ houseCondition: v })}
        options={getHouseConditionOptions(data.houseType)} 
      />
    </div>
  </StepWrapper>
);

export const Step4 = ({ data, updateData }: StepProps) => {
  const [floorPlanFiles, setFloorPlanFiles] = React.useState<File[]>([]);
  const [siteMediaFiles, setSiteMediaFiles] = React.useState<File[]>([]);
  const floorInputRef = React.useRef<HTMLInputElement | null>(null);
  const mediaInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFloorFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!next.length) return;
    setFloorPlanFiles(next);
    updateData({ floorPlanUploaded: true });
  };

  const handleMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (!next.length) return;
    setSiteMediaFiles(next);
    // 只要有任一类附件，即认为 Q2-4 已同步过资料
    if (!data.floorPlanUploaded) {
      updateData({ floorPlanUploaded: true });
    }
  };

  return (
    <StepWrapper title="房型资料同步" subtitle="房屋类型与现状 · 开启深度分析">
      <div className="space-y-6">
        {/* Q2-2：房屋类型与现状 */}
        <SegmentedRadio
          label="房屋类型"
          value={data.houseType}
          onChange={(v: string) => updateHouseTypeWithConditionGuard(updateData, v, data.houseCondition)}
          options={['新房', '二手房', '老房翻新']}
        />
        <SegmentedRadio
          label="房屋现状"
          value={data.houseCondition}
          onChange={(v: string) => updateData({ houseCondition: v })}
          options={getHouseConditionOptions(data.houseType)}
        />

        <div className="space-y-3">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            上传户型图
          </SubQuestion>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => floorInputRef.current?.click()}
          >
            <p className="text-gray-500 mb-4">
              {floorPlanFiles.length > 0 ? '已选择户型图，可重新选择替换' : '点击或拖拽上传户型图'}
            </p>
            <button
              type="button"
              className="bg-[#FF9C3E] text-white px-6 py-2 rounded-full text-sm font-medium"
            >
              选择文件
            </button>
            <input
              ref={floorInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFloorFiles(e.target.files)}
            />
            {floorPlanFiles.length > 0 && (
              <div className="mt-4 text-xs text-gray-600 text-left max-h-24 overflow-y-auto">
                {floorPlanFiles.map((file) => (
                  <div key={file.name} className="truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            上传现场视频/照片
          </SubQuestion>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => mediaInputRef.current?.click()}
          >
            <p className="text-gray-500 mb-4">
              {siteMediaFiles.length > 0 ? '已选择现场素材，可重新选择替换' : '点击或拖拽上传现场视频/照片'}
            </p>
            <button
              type="button"
              className="bg-[#FF9C3E] text-white px-6 py-2 rounded-full text-sm font-medium"
            >
              选择文件
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => handleMediaFiles(e.target.files)}
            />
            {siteMediaFiles.length > 0 && (
              <div className="mt-4 text-xs text-gray-600 text-left max-h-24 overflow-y-auto">
                {siteMediaFiles.map((file) => (
                  <div key={file.name} className="truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center pt-4">此步骤也可稍后在产品里补充</p>
      </div>
    </StepWrapper>
  );
};

export const Step5 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="Q2-5：房屋现状评估" subtitle="采光、层高、通风、噪音情况">
    <div className="space-y-4">
      <div className="space-y-1">
        <SubQuestion className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          采光情况
        </SubQuestion>
        <div className="grid grid-cols-4 gap-2">
          <IconRadioCard icon={Sun} label="极佳" description="全天有光" selected={data.lighting === '极佳，全天有阳光'} onClick={() => updateData({ lighting: '极佳，全天有阳光' })} />
          <IconRadioCard icon={CloudSun} label="良好" description="半天有光" selected={data.lighting === '良好，半天有阳光'} onClick={() => updateData({ lighting: '良好，半天有阳光' })} />
          <IconRadioCard icon={Cloud} label="一般" description="需开灯辅助" selected={data.lighting === '一般，需要开灯'} onClick={() => updateData({ lighting: '一般，需要开灯' })} />
          <IconRadioCard icon={Moon} label="较差" description="依赖人工照明" selected={data.lighting === '较差，采光受限'} onClick={() => updateData({ lighting: '较差，采光受限' })} />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-1">
        <SubQuestion className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          层高情况
        </SubQuestion>
        <SegmentedRadio
          options={[
            { label: '宽敞 (2.8m+)', value: '2.8米以上 (宽敞)' },
            { label: '标准 (2.6-2.8m)', value: '2.6-2.8米 (标准)' },
            { label: '偏低 (2.6m-)', value: '2.6米以下 (偏低)' }
          ]}
          value={data.ceilingHeight}
          onChange={(val: string) => updateData({ ceilingHeight: val })}
        />
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-1">
        <SubQuestion className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          通风情况
        </SubQuestion>
        <div className="grid grid-cols-4 gap-2">
          <IconRadioCard icon={Wind} label="南北通透" description="对流极佳" selected={data.ventilation === '南北通透'} onClick={() => updateData({ ventilation: '南北通透' })} />
          <IconRadioCard icon={Fan} label="通风良好" description="流通顺畅" selected={data.ventilation === '通风良好'} onClick={() => updateData({ ventilation: '通风良好' })} />
          <IconRadioCard icon={CloudRain} label="单面通风" description="需加强循环" selected={data.ventilation === '单面通风'} onClick={() => updateData({ ventilation: '单面通风' })} />
          <IconRadioCard icon={VolumeMute} label="通风较差" description="依赖新风" selected={data.ventilation === '通风较差'} onClick={() => updateData({ ventilation: '通风较差' })} />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 space-y-1">
        <SubQuestion className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          噪音情况
        </SubQuestion>
        <div className="grid grid-cols-4 gap-2">
          <IconRadioCard icon={VolumeX} label="非常安静" description="无明显噪音" selected={data.noise === '非常安静'} onClick={() => updateData({ noise: '非常安静' })} />
          <IconRadioCard icon={Volume1} label="偶有噪音" description="偶尔有轻微声音" selected={data.noise === '偶有噪音'} onClick={() => updateData({ noise: '偶有噪音' })} />
          <IconRadioCard icon={Volume2} label="临街/较吵" description="能听到车流声" selected={data.noise === '临街/较吵'} onClick={() => updateData({ noise: '临街/较吵' })} />
          <IconRadioCard icon={VolumeMute} label="非常吵闹" description="需深度隔音" selected={data.noise === '非常吵闹'} onClick={() => updateData({ noise: '非常吵闹' })} />
        </div>
      </div>
    </div>
  </StepWrapper>
);

export const Step6 = ({ data, updateData }: StepProps) => {
  const options = [
    { value: 'A', label: '男主人' },
    { value: 'B', label: '女主人' },
    { value: 'C', label: '长辈/长住家属' }
  ];

  const getSpaceOptions = () => {
    switch (data.role) {
      case 'A':
        return [
          { label: '智能书房', desc: '需要高效办公与游戏娱乐的平衡。' },
          { label: '客厅影音中心', desc: '追求极致的视听感受。' },
          { label: '社交餐厨', desc: '喜欢邀请朋友回家小酌。' }
        ];
      case 'B':
        return [
          { label: '梦幻衣帽间', desc: '需要博物馆级别的陈列与分类。' },
          { label: '全能厨房', desc: '享受烹饪与家人互动的时光。' },
          { label: '主卧疗愈区', desc: '追求极致包裹感的睡眠环境。' }
        ];
      case 'C':
        return [
          { label: '阳光卧室', desc: '极致的采光与通风要求。' },
          { label: '茶室/宁静角', desc: '一个可以独处、饮茶或阅读的地方。' },
          { label: '独立卫浴', desc: '强调安全性与便捷性。' }
        ];
      default:
        return [];
    }
  };

  const spaceOptions = getSpaceOptions();

  const toggleSpace = (space: string) => {
    const current = data.favoriteSpace || [];
    if (current.includes(space)) {
      updateData({ favoriteSpace: current.filter((s: string) => s !== space) });
    } else {
      updateData({ favoriteSpace: [...current, space] });
    }
  };

  return (
    <StepWrapper title="Q2-6：核心成员角色">
      <div className="space-y-8">
        <div className="space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            为了提供更符合您生活习惯的设计逻辑，请问您在未来的家中是哪类核心成员？
          </SubQuestion>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map(opt => (
              <RadioCard
                key={opt.value}
                label={opt.label}
                selected={data.role === opt.value}
                onClick={() => {
                  if (data.role !== opt.value) {
                    updateData({ role: opt.value, favoriteSpace: [] });
                  }
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            在这个家里，哪个空间是您愿意花费最多心思（或待得最久）的？
          </SubQuestion>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.role ? (
              spaceOptions.map(opt => (
                <CheckboxCard
                  key={opt.label}
                  label={opt.label}
                  description={opt.desc}
                  selected={(data.favoriteSpace || []).includes(opt.label)}
                  onClick={() => toggleSpace(opt.label)}
                />
              ))
            ) : (
              <div className="col-span-full text-sm text-gray-400 bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                请先选择上方的核心成员角色，以解锁专属空间推荐
              </div>
            )}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export const Step6_1 = ({ data, updateData }: StepProps) => {
  const members = [
    { id: 'daughter', label: '女儿', emoji: '👧' },
    { id: 'son', label: '儿子', emoji: '👦' },
    { id: 'cat', label: '猫猫', emoji: '🐱' },
    { id: 'dog', label: '狗狗', emoji: '🐶' }
  ];

  const spacesMap: Record<string, { title: string; desc: string; options: string[] }> = {
    daughter: {
      title: '女儿的空间需求',
      desc: '设计逻辑支撑 (SDI系统)：关注照明护眼、环保等级、成长可变性。',
      options: ['梦幻公主房', '独立书画区', '乐器练琴房', '超大储衣空间']
    },
    son: {
      title: '儿子的空间需求',
      desc: '设计逻辑支撑 (SDI系统)：关注耐划耐磨材料、电源插座布局、隔音。',
      options: ['乐高/积木区', '运动攀爬墙', '电脑电竞区', '独立手作台']
    },
    cat: {
      title: '猫猫的空间需求',
      desc: '设计逻辑支撑 (SDI系统)：关注新风除味、防抓材质、垂直动线。',
      options: ['猫墙/跑道', '嵌入式猫砂盆', '阳台封窗', '独立喂食区']
    },
    dog: {
      title: '狗狗的空间需求',
      desc: '设计逻辑支撑 (SDI系统)：关注地面防滑、防撞角设计、低位插座。',
      options: ['进门洗脚池', '独立卧榻', '宠物互动区', '扫拖机器人基地']
    }
  };

  const toggleMember = (id: string) => {
    const current = data.additionalMembers || [];
    if (current.includes(id)) {
      updateData({ additionalMembers: current.filter((m: string) => m !== id) });
    } else {
      updateData({ additionalMembers: [...current, id] });
    }
  };

  const toggleSpace = (memberId: string, space: string) => {
    const key = `${memberId}Spaces` as keyof FormData;
    const current = (data[key] as string[]) || [];
    if (current.includes(space)) {
      updateData({ [key]: current.filter((s: string) => s !== space) });
    } else {
      updateData({ [key]: [...current, space] });
    }
  };

  return (
    <StepWrapper title="Q2-6 附加：其他家庭成员">
      <div className="space-y-6">
        <div className="space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            有其他成员你想记录他们的活动空间吗？
          </SubQuestion>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {members.map(m => {
              const isSelected = (data.additionalMembers || []).includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`w-full flex flex-col items-center justify-center text-center p-4 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white ring-2 ring-[#EF6B00] shadow-[0_2px_10px_rgba(239,107,0,0.12)] transform scale-[1.02]' 
                      : 'bg-white hover:bg-gray-50 shadow-[0_1px_5px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors duration-300 text-2xl ${
                    isSelected ? 'bg-[#EF6B00]/10' : 'bg-[#FFF9E8]'
                  }`}>
                    {m.emoji}
                  </div>
                  <h3 className={`text-sm font-bold transition-colors duration-300 ${
                    isSelected ? 'text-[#EF6B00]' : 'text-gray-800'
                  }`}>
                    {m.label}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>

        {(data.additionalMembers || []).length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {(data.additionalMembers || []).map((memberId: string) => {
              const config = spacesMap[memberId];
              if (!config) return null;
              const selectedSpaces = (data[`${memberId}Spaces` as keyof FormData] as string[]) || [];
              
              return (
                <div key={memberId} className="space-y-3 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-lg">{members.find(m => m.id === memberId)?.emoji}</span>
                      {config.title}
                    </h4>
                    <p className="text-xs text-[#EF6B00] mt-1.5 bg-[#EF6B00]/5 inline-block px-2 py-1 rounded-md">
                      {config.desc}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {config.options.map(opt => (
                      <CheckboxCard
                        key={opt}
                        label={opt}
                        selected={selectedSpaces.includes(opt)}
                        onClick={() => toggleSpace(memberId, opt)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StepWrapper>
  );
};

export const Step7 = ({ data, updateData }: StepProps) => {
  const options = [
    { value: 'A', label: '独立决策', desc: '我可以全权决定，追求效率，希望沟通直接精准。' },
    { value: 'B', label: '深度共创', desc: '我与家人共同参与，重大决策需内部达成共识。' },
    { value: 'C', label: '贴心参谋', desc: '我仅负责协助，最终决策由主要使用者决定。' }
  ];

  return (
    <StepWrapper title="Q2-7：沟通协作方式">
      <div className="space-y-6">
        <div className="space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            在未来的项目推进中，我们应如何更好地与您及家人协作？
          </SubQuestion>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map(opt => (
              <RadioCard
                key={opt.value}
                label={opt.label}
                description={opt.desc}
                selected={data.collaboration === opt.value}
                onClick={() => updateData({ collaboration: opt.value })}
              />
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            您希望的参与方式是什么样的？
          </SubQuestion>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SquareRadioCard label="全程参与，把控细节" selected={data.involvement === 'high'} onClick={() => updateData({ involvement: 'high' })} />
            <SquareRadioCard label="抓大放小，定期确认" selected={data.involvement === 'medium'} onClick={() => updateData({ involvement: 'medium' })} />
            <SquareRadioCard label="全权委托，拎包入住" selected={data.involvement === 'low'} onClick={() => updateData({ involvement: 'low' })} />
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export const Step8 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="Q2-8：计划节奏" subtitle="您的入住与完工预期">
    <div className="space-y-4">
      <div className="space-y-3">
        <SubQuestion className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          期望完工时间
        </SubQuestion>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['3个月内', '3-6个月', '半年到一年', '一年以上'].map(opt => (
            <SquareRadioCard
              key={opt}
              label={opt}
              selected={data.timeline === opt}
              onClick={() => updateData({ timeline: opt })}
            />
          ))}
        </div>
      </div>
    </div>
  </StepWrapper>
);

export const Step9 = ({ data, updateData }: StepProps) => {
  const groups = [
    { title: '公区', items: ['客厅', '餐厅'] },
    { title: '厨房', items: ['开放厨房', '封闭厨房'] },
    { title: '卧室', items: ['主卧室', '次卧室', '小孩卧室', '老人卧室'] },
    { title: '卫浴', items: ['主卫浴室', '公卫浴室', '次卫浴室'] },
    { title: '其他', items: ['书房', '花园'] }
  ];

  const allOptions = groups.flatMap(g => g.items);

  const parseCoreSpaces = (str: string) => {
    const counts: Record<string, number> = {};
    allOptions.forEach(opt => counts[opt] = 0);
    
    if (!str) return counts;
    
    allOptions.forEach(key => {
      const match = str.match(new RegExp(`(\\d+)${key}`));
      if (match) {
        counts[key] = parseInt(match[1]);
      }
    });
    
    return counts;
  };

  const counts = parseCoreSpaces(data.coreSpaces);

  const updateCount = (key: string, val: number) => {
    const newCounts = { ...counts, [key]: val };
    const newStr = allOptions
      .filter(name => newCounts[name] > 0)
      .map(name => `${newCounts[name]}${name}`)
      .join('');
    updateData({ coreSpaces: newStr });
  };

  return (
    <StepWrapper title="Q2-9：核心空间规划数量" subtitle="核心空间数量需求及未来规划">
      <div className="space-y-8">
        {groups.map(group => (
          <div key={group.title} className="space-y-3">
            <SubQuestion className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
              {group.title}
            </SubQuestion>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((name) => (
                <Counter
                  key={name}
                  label={name}
                  value={counts[name]}
                  onChange={(v: number) => updateCount(name, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepWrapper>
  );
};

export const Step10 = ({ data, updateData }: StepProps) => {
  const habits = [
    '经常做饭 (重油烟)',
    '偶尔做饭 (轻食/简餐)',
    '基本点外卖 (外出就餐)'
  ];
  
  const kitchens = [
    '不需要 (一个厨房足够)',
    '需要中西分厨',
    '需要独立辅食区 (轻食区)'
  ];

  return (
    <StepWrapper title="Q2-10：烹饪习惯" subtitle="了解您的厨房使用需求">
      <div className="space-y-10">
        <div className="space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            吃饭是比较喜欢做饭还是点外卖?
          </SubQuestion>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {habits.map(opt => {
              const { title, desc } = parseLabel(opt);
              const valueMap: Record<string, string> = {
                '经常做饭': 'heavy',
                '偶尔做饭': 'light',
                '基本点外卖': 'none'
              };
              return (
                <SquareRadioCard
                  key={opt}
                  label={title}
                  description={desc}
                  selected={data.cookingHabit === valueMap[title]}
                  onClick={() => updateData({ cookingHabit: valueMap[title] })}
                />
              );
            })}
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <SubQuestion className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            是否会因为口味不同而分别烹饪?需要第二个厨房?
          </SubQuestion>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {kitchens.map(opt => {
              const { title, desc } = parseLabel(opt);
              const valueMap: Record<string, string> = {
                '不需要': 'no',
                '需要中西分厨': 'yes_split',
                '需要独立辅食区': 'yes_light'
              };
              return (
                <SquareRadioCard
                  key={opt}
                  label={title}
                  description={desc}
                  selected={data.secondKitchen === valueMap[title]}
                  onClick={() => updateData({ secondKitchen: valueMap[title] })}
                />
              );
            })}
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export const Step11 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="Q2-11：社交习惯" subtitle="是否经常有朋友聚会？">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <SquareRadioCard label="经常" description="喜欢在家招待朋友" selected={data.partyFrequency === 'high'} onClick={() => updateData({ partyFrequency: 'high' })} />
      <SquareRadioCard label="偶尔" description="三五好友小聚" selected={data.partyFrequency === 'medium'} onClick={() => updateData({ partyFrequency: 'medium' })} />
      <SquareRadioCard label="很少" description="更喜欢安静独处" selected={data.partyFrequency === 'low'} onClick={() => updateData({ partyFrequency: 'low' })} />
    </div>
  </StepWrapper>
);

export const Step12 = ({ data, updateData }: StepProps) => (
  <StepWrapper title="Q2-12：聚餐习惯" subtitle="就餐人数需求">
    <div className="space-y-6">
      <div className="space-y-3">
        <SubQuestion className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          平时几人就餐？
        </SubQuestion>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['1-2人', '3-4人', '5-6人', '6人以上'].map(opt => (
            <SquareRadioCard
              key={opt}
              label={opt}
              selected={data.diningCount === opt}
              onClick={() => updateData({ diningCount: opt })}
            />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <SubQuestion className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          逢年过节最多需要容纳几人？
        </SubQuestion>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['4-6人', '7-10人', '10人以上'].map(opt => (
            <SquareRadioCard
              key={opt}
              label={opt}
              selected={data.festivalDiningCount === opt}
              onClick={() => updateData({ festivalDiningCount: opt })}
            />
          ))}
        </div>
      </div>
    </div>
  </StepWrapper>
);

export const Step13 = ({ data, updateData }: StepProps) => {
  const options = [
    { id: 'media', label: '影音娱乐', desc: '看电视、投影大片、沉浸式视听' },
    { id: 'kids', label: '亲子互动', desc: '陪伴孩子玩耍、爬行、亲子游戏' },
    { id: 'work', label: '办公学习', desc: '阅读、居家工作、辅导孩子作业' },
    { id: 'social', label: '社交会客', desc: '招待亲友、下午茶、聚会聊天' },
    { id: 'fitness', label: '健身运动', desc: '瑜伽、拉伸、体感游戏' },
    { id: 'relax', label: '冥想放松', desc: '独处、听音乐、发呆、放空' }
  ];

  const toggleFeature = (id: string) => {
    const current = data.livingRoomFeature || [];
    if (current.includes(id)) {
      updateData({ livingRoomFeature: current.filter(i => i !== id) });
    } else {
      updateData({ livingRoomFeature: [...current, id] });
    }
  };

  return (
    <StepWrapper title="Q2-13：客厅活动习惯" subtitle="您希望在客厅，主要的家庭活动是什么（可多选）">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(opt => (
          <SquareRadioCard
            key={opt.id}
            label={opt.label}
            description={opt.desc}
            selected={(data.livingRoomFeature || []).includes(opt.id)}
            onClick={() => toggleFeature(opt.id)}
          />
        ))}
      </div>
    </StepWrapper>
  );
};

export const Step14 = ({ data, updateData }: StepProps) => {
  const options = [
    '大量鞋履/包柜',
    '衣帽间/衣柜系统',
    '厨房餐储收纳',
    '展示性收纳（书籍、收藏品）',
    '儿童玩具收纳',
    '清洁工具/家政柜'
  ];

  const toggleOption = (opt: string) => {
    const current = data.storageFocus || [];
    if (current.includes(opt)) {
      updateData({ storageFocus: current.filter(item => item !== opt) });
    } else {
      updateData({ storageFocus: [...current, opt] });
    }
  };

  return (
    <StepWrapper title="Q2-14：收纳重点" subtitle="请选择您最关注的收纳区域（可多选）">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(opt => {
          const label =
            opt === '展示性收纳（书籍、收藏品）'
              ? (
                <>
                  展示性收纳
                  <br />
                  <span className="font-normal">（书籍、收藏品）</span>
                </>
                )
              : opt;

          return (
            <SquareRadioCard
              key={opt}
              label={label}
              selected={(data.storageFocus || []).includes(opt)}
              onClick={() => toggleOption(opt)}
            />
          );
        })}
      </div>
    </StepWrapper>
  );
};

export const Step15 = ({ data, updateData }: StepProps) => {
  const options = [
    '必须彻底干湿分离 (洗手台外置)',
    '常规干湿分离 (淋浴房/浴帘)',
    '无特殊要求'
  ];

  return (
    <StepWrapper title="Q2-15：干湿分离" subtitle="卫生间干湿分离需求">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(opt => {
          const { title, desc } = parseLabel(opt);
          const valueMap: Record<string, string> = {
            '必须彻底干湿分离': 'strict',
            '常规干湿分离': 'normal',
            '无特殊要求': 'none'
          };
          return (
            <SquareRadioCard
              key={opt}
              label={title}
              description={desc}
              selected={data.dryWetSeparation === valueMap[title]}
              onClick={() => updateData({ dryWetSeparation: valueMap[title] })}
            />
          );
        })}
      </div>
    </StepWrapper>
  );
};

export const Step16 = ({ data, updateData }: StepProps) => {
  const [showWarning, setShowWarning] = React.useState(false);
  const options = [
    '绝对要环保（哪怕多花钱，也要进场就能住，没味儿、没甲醛）',
    '家里要极静（睡觉怕吵，受不了邻居动静或马路噪音）',
    '收纳够强大（空间利用率要高，东西放得下、找得到，拒绝杂乱）',
    '颜值即正义（一定要美观、高级，哪怕牺牲一点实用性，也要保证视觉上的极致呈现）',
    '严格控预算（说好花多少就花多少，不能一直超支）',
    '必须按时住（工期不能拖，定好了什么时候完工就得完工）'
  ];

  const toggleOption = (opt: string) => {
    const current = data.bottomLine || [];
    if (current.includes(opt)) {
      updateData({ bottomLine: current.filter(item => item !== opt) });
      setShowWarning(false);
    } else {
      if (current.length >= 2) {
        setShowWarning(true);
        return;
      }
      updateData({ bottomLine: [...current, opt] });
      setShowWarning(false);
    }
  };

  return (
    <StepWrapper title="Q2-16：底线与妥协" subtitle="这个家的“底线”，您最不能妥协的是？">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <SubQuestion className="flex items-center gap-2 mb-0!">
            <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
            这个家的“底线”，您最不能妥协的是？
          </SubQuestion>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${data.bottomLine.length >= 2 ? 'bg-[#EF6B00]/10 text-[#EF6B00]' : 'bg-gray-100 text-gray-500'}`}>
              已选 {data.bottomLine.length}/2
            </span>
            {showWarning && (
              <span className="text-xs text-[#EF6B00] animate-pulse font-bold">
                最多只能选择2项哦！
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {options.map(opt => {
            const { title, desc } = parseLabel(opt);
            return (
              <SquareRadioCard
                key={opt}
                label={title}
                description={desc}
                selected={(data.bottomLine || []).includes(opt)}
                onClick={() => toggleOption(opt)}
              />
            );
          })}
        </div>
      </div>
    </StepWrapper>
  );
};

const parseLabel = (text: string) => {
  const index = text.indexOf('（');
  const index2 = text.indexOf('(');
  const finalIndex = index !== -1 ? index : index2;
  
  if (finalIndex !== -1) {
    const endChar = index !== -1 ? '）' : ')';
    const endIndex = text.lastIndexOf(endChar);
    return {
      title: text.substring(0, finalIndex).trim(),
      desc: text.substring(finalIndex + 1, endIndex !== -1 ? endIndex : text.length).trim()
    };
  }
  return { title: text, desc: '' };
};

export const Step17 = ({ data, updateData }: StepProps) => {
  const options = [
    { label: '没讲究，怎么舒服怎么来', desc: '纯科学布局，追求空间利用率和动线最优' },
    { label: '避开大众忌讳就行', desc: '比如开门不直接撞见阳台、床头不靠窗、卫生间门不对床等常规避讳' },
    { label: '有比较看重的特定要求', desc: '比如一定要有独立玄关/影壁、特定的财位摆放、或者某间房必须给谁住' },
    { label: '我有专门的方案，需配合执行', desc: '已经请了专业人士看过，有具体的方位图和尺寸要求，设计师需全盘配合' }
  ];

  return (
    <StepWrapper title="Q2-17：风水布局" subtitle="关于新家的“风水布局”，您有特殊讲究吗？">
      <div className="space-y-6">
        <SubQuestion className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#EF6B00] rounded-full"></div>
          关于新家的“风水布局”，您有特殊讲究吗？
        </SubQuestion>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map(opt => (
            <RadioCard
              key={opt.label}
              label={opt.label}
              description={opt.desc}
              selected={data.fengshui === opt.label}
              onClick={() => updateData({ fengshui: opt.label })}
            />
          ))}
        </div>
      </div>
    </StepWrapper>
  );
};

export const Step18 = ({ data, updateData }: StepProps) => {
  const options = [
    { label: '全屋网络覆盖', icon: Wifi, desc: '每一个角落 Wi-Fi 信号都满格，刷剧不卡顿' },
    { label: '一键场景控制', icon: Zap, desc: '离家一键关全屋灯，回家自动开启迎宾模式' },
    { label: '氛围灯光调控', icon: Lightbulb, desc: '灯光可以调明暗、换冷暖，甚至随音乐律动' },
    { label: '隐形背景音乐', icon: Music, desc: '天花板里藏喇叭，让音乐像空气一样弥漫全屋' },
    { label: '24h 居家安防', icon: ShieldCheck, desc: '智能门锁、可视对讲，出门在外也能监控安全' },
    { label: '家电自动联动', icon: Cpu, desc: '传感器感应到人自动开空调，下雨自动关窗户' },
    { label: '遮阳自动系统', icon: Sun, desc: '早上窗帘定时开启，阳光太晒时遮阳帘自动降下' }
  ];

  const toggleOption = (label: string) => {
    const current = data.smartHomeOptions || [];
    const next = current.includes(label) ? current.filter((x) => x !== label) : [...current, label];
    updateData({ smartHomeOptions: next });
  };

  return (
    <StepWrapper title="Q2-18：智能需求" subtitle="您对新家的“智能程度”有什么期待？">
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map(opt => (
            <SquareCheckboxCard
              key={opt.label}
              label={opt.label}
              icon={opt.icon}
              description={opt.desc}
              selected={(data.smartHomeOptions || []).includes(opt.label)}
              onClick={() => toggleOption(opt.label)}
            />
          ))}
        </div>
      </div>
    </StepWrapper>
  );
};

export const Step19 = ({ data, updateData }: StepProps) => {
  const options = [
    { label: '新风系统', icon: Wind },
    { label: '中央空调', icon: AirVent },
    { label: '全空气系统', icon: Cloud },
    { label: '全屋净水', icon: Droplets },
    { label: '地暖系统', icon: Thermometer }
  ];

  const toggleOption = (opt: string) => {
    const current = data.comfortSystems || [];
    const next = current.includes(opt) ? current.filter((x) => x !== opt) : [...current, opt];
    updateData({ comfortSystems: next });
  };

  return (
    <StepWrapper title="Q2-19：系统选择" subtitle="请问您计划为新家配置哪些舒适系统？">
      <div className="grid grid-cols-3 gap-3">
        {options.map(opt => (
          <SquareCheckboxCard
            key={opt.label}
            label={opt.label}
            icon={opt.icon}
            selected={(data.comfortSystems || []).includes(opt.label)}
            onClick={() => toggleOption(opt.label)}
          />
        ))}
      </div>
    </StepWrapper>
  );
};

export const Step20 = ({ data, updateData }: StepProps) => {
  const options = [
    { label: '智能门锁', icon: Lock },
    { label: '洗碗机', icon: Waves },
    { label: '厨房垃圾处理器', icon: Trash2 },
    { label: '智能马桶盖', icon: Bath },
    { label: '蒸烤箱', icon: Flame },
    { label: '扫拖机器人', icon: Bot },
    { label: '干衣机', icon: Wind }
  ];

  const toggleOption = (opt: string) => {
    const current = data.devices || [];
    const next = current.includes(opt) ? current.filter((x) => x !== opt) : [...current, opt];
    updateData({ devices: next });
  };

  return (
    <StepWrapper title="Q2-20：设备需求" subtitle="计划购入的家电设备">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(opt => (
          <SquareCheckboxCard
            key={opt.label}
            label={opt.label}
            icon={opt.icon}
            selected={(data.devices || []).includes(opt.label)}
            onClick={() => toggleOption(opt.label)}
          />
        ))}
      </div>
    </StepWrapper>
  );
};

export const Step21 = ({ data, updateData, goToWorkbench, goToLogin }: StepProps) => {
  const [showModal, setShowModal] = React.useState(false);
  const MY_HOME_URL = import.meta.env.VITE_MY_HOME_URL || import.meta.env.VITE_APP_HOME_URL || '/';
  const options = [
    '无障碍需求',
    '旧家具留存',
    '儿童成长性需求',
    '亲友留宿需求',
    '未来1–2年是否可能出现居住变化（添娃/父母同住/远程办公）'
  ];

  const toggleOption = (opt: string) => {
    const current = data.otherNeedsOptions || [];
    const next = current.includes(opt) ? current.filter((x) => x !== opt) : [...current, opt];
    updateData({ otherNeedsOptions: next });
  };

  return (
    <>
      <StepWrapper title="Q2-21：个性需求" subtitle="其他特殊需求">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {options.map(opt => (
              <SquareCheckboxCard
                key={opt}
                label={opt}
                selected={(data.otherNeedsOptions || []).includes(opt)}
                onClick={() => toggleOption(opt)}
              />
            ))}
          </div>
          
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <TextInput
              label="其他补充需求"
              value={data.otherNeeds}
              onChange={(v: string) => updateData({ otherNeeds: v })}
              placeholder="任何其他想告诉我们的"
            />
          </div>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-8 py-3 rounded-xl bg-[#FF9C3E] text-white text-base font-medium hover:bg-[#EF6B00] transition-colors"
            >
              完成测试并提交
            </button>
          </div>
        </div>
      </StepWrapper>

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              感谢您的耐心，您填写的信息我们会生成一份专属项目需求书，并安排专业顾问认真阅读并分析。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              如果您想更改信息，可进入您的首页查看项目需求书并编辑。
            </p>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-5 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                了解并关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  if (goToLogin) goToLogin();
                  else if (goToWorkbench) goToWorkbench();
                  else window.location.assign(MY_HOME_URL);
                }}
                className="flex-1 px-5 py-2 rounded-xl bg-[#FF9C3E] text-white text-sm font-medium hover:bg-[#EF6B00] transition-colors"
              >
                进入我的首页
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const StepContract = ({ data, updateData, nextStep }: StepProps) => {
  const [showSignature, setShowSignature] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const [showFullscreen, setShowFullscreen] = React.useState(false);
  const [canSign, setCanSign] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = React.useRef(false);
  const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const CONTRACT_TEXT = [
    '                           项目服务框架协议  ',
    ' 合同编号： LG-EPC-C_【项目简称 AMI】-【集团项目唯一 ID 唯一编号】',
    '合同编号： LG-EPC-B_【项目简称 AMI】-【集团项目唯一 ID 唯一编号】',
    '',
    '委托方（甲方）：【】',
    '身份证 / 社会统一信用代码：【】',
    '联系人：【】',
    '联系电话：【】',
    '联系邮件：【】',
    '联系地址：【】',
    ' ',
    '受托方（乙方）：【上海居梦唯伊建筑设计工程有限公司】',
    '统一社会信用代码：【91310114MAD8QKXR5K】',
    '联系人：【】',
    '联系电话：【】',
    '联系邮件：【】',
    '联系地址：【】',
    ' ',
    '1. 合同背景',
    '1.1 签约背景',
    '  根据相关法律法规，甲乙双方方在平等自愿、协商一致的基础上，甲方拟将其位于【项目地址 AMI】的【项目名称 AMI】（下称“项目”）委托给乙方，由乙方提供 EPC 一体化智造服务，涵盖工程设计（Engineering）、选品采购（Procurement）、建造施工（Construction）全流程服务。',
    '1.2 项目概况',
    '  项目代码：【集团项目唯一 ID AMI】',
    '  项目国家：【】',
    '  项目城市：【】',
    '  项目面积：【】',
    '  项目简介：【一段话陈述项目概况，基于销售团队与客户前期沟通的文字总结】',
    '  ',
    '2. 订单管理',
    '2.1 服务介绍',
    '  1. 乙方将为甲方项目提供订单式的一体化智造服务，服务内容、验收标准和售后约定以对应 EPC 订单约定为准。',
    '  2. 为甲方提供订单服务的主体，可由乙方或与乙方属同一集团控制的公司（本协议统称“乙方”）单独或共同提供，不影响本协议效力且无须另行约定。乙方将指定甲方向前述唯一公司账户完成款项支付。',
    '  3. 所有EPC 订单服务期限按照双方约定，从【xxxx年xx月xx日】至【xxxx年xx月xx日】，共计【自然日】天。具体约定：',
    '    - 【xxxx年xx月xx日】开始进入本项目第一个订单的意向期；',
    '    - 【xxxx年xx月xx日】之前完成本项目的最后一个订单验收。',
    '2.2 服务流程',
    '  1. 状态图解:',
    '[图片]',
    '  2. 意向期：收集甲方需求后，乙方生成意向报价单供甲方决策。',
    '  3. 订购期：甲乙双方明确订单服务事项与详细报价，乙方发送订购报价单与甲方成交订单。',
    '  4. 交付期：',
    '    - 甲方确保用于支付订单的资金充足，乙方按甲方最后确认的订购报价单约定，交付成果；',
    '    - 若甲方在订单交付中提出终止订单，乙方将根据实际发生费用向甲方发送终止结算单。',
    '  5. 验收期：',
    '    - 验收标准详见订购报价单，甲方需在收到验收邀约后的当月完成验收；',
    '    - 甲方验收通过后，乙方将发送并确认交付结算单，逾期未答复视为验收合格；',
    '    - 如验收后订单成果涉及整改，乙方将在整改完成后，再次邀约甲方验收，直至验收通过；',
    '    - 乙方整改通过甲方验收后，乙方将发送并确认整改结算单，逾期未答复视为验收合格。',
    '  6. 维保期： ',
    '    - 维保期详见交付结算单或整改结算单，具体范围及时效以结算单中约定为准；',
    '    - 甲方可就订单交付成果提出维保需求，乙方根据维保期约定可提供免费或付费维保服务；',
    '    - 乙方维保服务完成后将与甲方现场确认维保结算单，甲方确保用于支付订单的资金充足；',
    '    - 维保期结束后，乙方不再对该订单提供服务。甲方若有新需求，可新建EPC订单另行委托。',
    '2.3 支付结算',
    '  1. 支付方式：',
    '    - 甲方使用不同于签约主体的一个或多个付款主体时，应在支付前签署补充协议；',
    '    - 甲方依据订购报价单，足额支付费用，乙方依据订购报价单扣款；',
    '    - 甲方也可依据项目预算树一次性支付，乙方依据多个订购报价单整体扣款。',
    '  2. 验收结算：',
    '    - 订单验收通过后，双方依据交付结算单或整改结算单或进行结算，超出订购报价单金额的部分，甲方应补充支付；',
    '    - 若订单在交付中甲方提出终止订单，乙方将依据终止结算单进行结算，超出订购报价单金额的部分，甲方应补充支付；',
    '    - 订单维保服务完成后，乙方与甲方现场确认维保结算单，超出订购报价单金额的部分，甲方应补充支付。',
    '  3. 发票开具：',
    '    - 乙方根据国家税务总局政策法规，可向甲方开具小规模纳税人增值税发票；',
    '    - 收到甲方开票请求后，乙方于验收完成后的次月15日完成发票开具；',
    '    - 甲方对发票种类或时效有特别要求的，应于支付订购报价单前告知乙方。',
    '2.4 账号信息',
    '  1. 甲方付款账号',
    '    - 银行户名：【】',
    '    - 开户行：【】',
    '    - 银行账号：【】',
    '  2. 甲方开票信息',
    '    - 发票抬头:【】',
    '    - 税号:【】',
    '    - 开户行:【】',
    '    - 账号:【】',
    '    - 地址:【】',
    '    - 电话:【】',
    '  3. 乙方收款账号',
    '    - 银行户名：居梦科技（深圳）有限公司',
    '    - 开户行：招商银行深圳分行滨海支行',
    '    - 银行账号：7559 5346 5810 902',
    '    - 付款备注：【项目名称 AMI】',
    '',
    '3. 保密条款',
    '3.1 保密信息范围',
    '  甲方提供给乙方的包括但不限于个人身份信息、家庭住址、家庭成员信息、联系方式、联系地址、银行账户信息、预算金额、设计需求等全部信息；乙方及其供应商通过自研软件平台展示的项目方案、设计图、施工图、供应商信息、产品与服务信息、价格等不为公众所知，并经乙方采取了保密措施的信息为本合同约定的保密信息。',
    '3.2 保密义务',
    '  双方均应妥善保管和使用涉及对方保密信息，防止在任何地点、任何时间使这些信息处于失控状态。除法律规定必须公开外，一方未经对方许可，不得向任何第三方展示或披露任何对方的保密信息及有损于对方的信息。',
    '3.3 违约责任',
    '  除本合同另有约定外，一方违约则承担违约责任，并赔偿由此给对方造成的损失；此外，违约方还应承担守约方为此而支付的各项费用，包括但不限于诉讼费、保全费、保全保险费、律师费、评估费、鉴定费等必要费用。',
    '3.4 保密期限',
    '  本保密条款不因本协议解除、终止而失效。',
    '  ',
    '4.  协议变更',
    '4.1 协议解除',
    '  1. 若在协议解除或终止时无项目订单推进中，在双方协商一致后可以解除或终止协议。',
    '  2. 若在合同解除或终止时尚有推进中的项目销售订单，则由双方协商约定对应销售订单的结算方式，双方另行结算处理。',
    '4.2 协议终止',
    '  1. 本合同解除或终止后，乙方应当于7日内将项目的钥匙、资料等全部归还甲方，甲方应当及时接收，否则，由此产生的后果由甲方自行承担。',
    '  2. 本协议及附属沟通单据的解释、签订、生效、效力、履行和解决争议适用于中华人民共和国法律。因本协议引起的或与本协议有关的任何争议，双方应通过友好协商解决。协商不成的，任何一方均有权向乙方所在地有管辖权的司法机构提起诉讼或仲裁。',
    '4.3 不可抗力',
    '  因不可抗力导致合同无法履行的，受影响方应立即通知对方并提供证明。双方可协商延期履行或终止协议，终止时按已完工作量结算费用。',
    '  ',
    '5. 争议解决',
    '5.1 协议构成及补充',
    '  双方往来单据、邮件、传真、会议纪要、线上沟通等均为本协议组成部分，本协议未尽事宜由双方另行协商约定或参照后续或已经签署的协议及或单据内容执行。',
    '5.2 争议管辖',
    '  因本协议事项产生争议，【城市】所在地法院拥有专属管辖权。',
    '5.3 送达地址确认',
    '  本协议记载的联系方式为各方确认的重要文件、法律文书的送达地址，若发生变化的，变化方有义务书面通知对方。',
    '  ',
    '  ',
    '本协议自双方签字或盖章之日起生效。电子签署享有同等法律效力。本协议未尽事宜，由双方另行协商，并签订补充协议，补充协议与本合同具有同等法律效力。本协议一式两份，甲乙双方各执一份，具有同等法律效力。',
    '',
    '',
    '（以下无正文）          ',
    '',
    '甲方签字（盖章）： ',
    '   ',
    '                                                            ',
    '签署日期：    ',
    '',
    '',
    '',
    '乙方签字（盖章）：',
    '    ',
    '',
    '签署日期：                                                                                 ',
    '                                                            ',
    '                                 ',
  ].join('\n');

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
      setCanSign(true);
    }
  };

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    // 保证高分屏下清晰
    if (canvas.width !== rect.width * 2 || canvas.height !== rect.height * 2) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.scale(2, 2);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#111827';
      return ctx;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
    return ctx;
  };

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx) return;
    const point = getPoint(e);
    isDrawingRef.current = true;
    lastPointRef.current = point;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const ctx = getCanvasContext();
    if (!ctx || !lastPointRef.current) return;
    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleOpenSignature = () => {
    setShowFullscreen(false);
    setShowSignature(true);
    setHasDrawn(false);
    // 打开时清空画布
    setTimeout(() => {
      handleClear();
    }, 0);
  };

  const handleSubmitSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    updateData({ contractSignatureData: dataUrl as any, contractAccepted: true as any });
    setShowSignature(false);
    setShowFullscreen(false);
    nextStep();
  };

  return (
    <>
      <StepWrapper
        title="意向金支付合同"
        subtitle="请仔细阅读以下《项目服务框架协议》，确认后完成电子签署"
      >
        <div className="space-y-5">
          

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-6 text-xs leading-relaxed text-gray-700 max-h-64 overflow-y-auto custom-scrollbar">
            <div className="whitespace-pre-line font-serif text-[11px] leading-7 text-gray-900 tracking-wide pr-2 space-y-1.5">
              {CONTRACT_TEXT.split('\n').map((line, idx) => {
                if (line.trim() === '[图片]') {
                  return (
                    <div key={idx} className="my-4 flex justify-center">
                      <img
                        src={contractFlowImg}
                        alt="订单管理服务流程状态图解"
                        className="max-w-full rounded-lg border border-gray-200 shadow-sm"
                      />
                    </div>
                  );
                }
                return (
                  <p
                    key={idx}
                    className={idx === 0 ? 'text-center font-semibold text-[12px]' : ''}
                  >
                    {line || '\u00A0'}
                  </p>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            为保证阅读体验，建议先预览下方摘要内容，再点击按钮放大查看全文并完成合同签署。
          </p>

          <button
            type="button"
            onClick={() => {
              setShowFullscreen(true);
              setCanSign(false);
            }}
            className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF9C3E] px-4 py-3 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            <Maximize size={14} />
            放大查看并签署合同
          </button>
        </div>
      </StepWrapper>

      {showFullscreen && (
        <div className="fixed inset-0 z-[135] flex items-center justify-center px-3">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFullscreen(false)}
          />
          <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900 text-center">项目服务框架协议</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 text-center">
                  请完整阅读下方合同正文，滚动至底部后即可进行电子签署。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFullscreen(false)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
              >
                <Minimize size={12} />
                退出全屏
              </button>
            </div>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar bg-[#FDFCF8]"
            >
              <div className="mx-auto max-w-4xl bg-white rounded-2xl border border-gray-100 px-8 py-7 shadow-sm">
                <div className="whitespace-pre-line font-serif text-[12px] leading-7 text-gray-900 tracking-wide space-y-2">
                  {CONTRACT_TEXT.split('\n').map((line, idx) => {
                    if (line.trim() === '[图片]') {
                      return (
                        <div key={idx} className="my-6 flex justify-center">
                          <img
                            src={contractFlowImg}
                            alt="订单管理服务流程状态图解"
                            className="max-w-full rounded-xl border border-gray-200 shadow-md"
                          />
                        </div>
                      );
                    }
                    return (
                      <p
                        key={idx}
                        className={idx === 0 ? 'text-center font-semibold text-[13px]' : ''}
                      >
                        {line || '\u00A0'}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 space-y-3">
              <button
                type="button"
                disabled={!canSign}
                onClick={handleOpenSignature}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors active:scale-[0.99] ${
                  canSign ? 'bg-[#FF9C3E] hover:bg-[#EF6B00]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {data.contractSignatureData ? '重新签署并继续' : '已阅读至底部，前往签署'}
              </button>
              <p className="text-[11px] text-gray-500 text-center">
                {!canSign
                  ? '请先滚动阅读至合同最底部后，再进行签署。'
                  : '您已阅读至合同底部，可点击上方按钮完成签署。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* editor removed */}

      {showSignature && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSignature(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900">请在下方签名确认</h3>
              <p className="text-xs text-gray-500">
                请使用鼠标或触控板在签名框内手写签名，此签名将作为您确认本合同的电子签章记录。
              </p>
            </div>
            <div className="border border-gray-200 rounded-2xl bg-[#F9FAFB] overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-40 touch-none cursor-crosshair"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
              >
                清除重签
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignature(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={!hasDrawn}
                  onClick={handleSubmitSignature}
                  className={`px-4 py-2 rounded-xl text-xs font-medium text-white transition-colors ${
                    hasDrawn ? 'bg-[#FF9C3E] hover:bg-[#EF6B00]' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  确认签名并提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const StepPayment = () => {
  const [copied, setCopied] = React.useState(false);
  const accountName = '上海某某空间设计有限公司';
  const bankName = '中国工商银行 上海某某支行';
  const bankAccount = '6222 0000 1234 5678 888';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${accountName} ${bankName} ${bankAccount}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <StepWrapper
      title="意向金支付账号信息"
      subtitle="合同已确认，请根据以下信息进行转账支付"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#EF6B00]" />
            <span className="text-sm font-semibold text-gray-900">对公转账信息</span>
          </div>
          <div className="space-y-1.5 text-sm text-gray-800">
            <p>账户名称：{accountName}</p>
            <p>开户银行：{bankName}</p>
            <p>银行账号：{bankAccount}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-2 w-full rounded-xl bg-[#FF9C3E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#EF6B00] transition-colors active:scale-[0.99]"
          >
            {copied ? '已复制账号信息' : '一键复制全部信息'}
          </button>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          请您在备注中标注：项目城市 + 项目名称 + 姓名，方便我们快速匹配您的项目档案。
          转账完成后，顾问将尽快与您确认到账情况并安排后续服务。
        </p>
      </div>
    </StepWrapper>
  );
};
