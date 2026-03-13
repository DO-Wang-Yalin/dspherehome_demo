import React, { useState } from 'react';
import { Phone, ChevronLeft } from 'lucide-react';
import { StepWrapper } from '../../components/ui';
import { sendSmsCode, loginWithCode } from '../../services/auth';

export interface LoginPageProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export function LoginPage({ onSuccess, onBack }: LoginPageProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const phoneValid = /^1\d{10}$/.test(phone);
  const codeValid = /^\d{6}$/.test(code);
  const mockLoginEnabled = !!import.meta.env.DEV;

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
        if (!mockLoginEnabled) {
          setError(result.message || '发送验证码失败');
          return;
        }
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
    if (!mockLoginEnabled && !phoneValid) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (!mockLoginEnabled && !codeValid) {
      setError('请输入 6 位验证码');
      return;
    }
    if (mockLoginEnabled && (!phoneValid || !codeValid)) {
      onSuccess();
      return;
    }
    setSubmitting(true);
    try {
      const result = await loginWithCode(phone, code);
      if (!result.success) {
        if (!mockLoginEnabled) {
          setError(result.message || '验证失败，请检查验证码');
          return;
        }
        setError(result.message || '验证失败（测试模式已放行）');
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepWrapper noCard>
      <div className="flex flex-col items-center py-8 min-h-[60vh]">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-6 py-6 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFCE42]/10 px-3 py-1 mb-2">
            <Phone className="w-3.5 h-3.5 text-[#FFCE42]" />
            <span className="text-xs font-semibold text-[#C87800] tracking-wide">手机验证码登录</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">验证手机号并登录</h2>
          <p className="text-sm text-gray-500">我们将向该手机号发送验证码，用于完成登录。</p>

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
                className="w-full py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#FFCE42]/20 outline-none pl-11 pr-5 text-gray-800 placeholder-gray-400"
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
                className="flex-1 py-4 bg-[#FFF9E8] rounded-xl border-none focus:ring-2 focus:ring-[#FFCE42]/20 outline-none px-5 text-gray-800 placeholder-gray-400"
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
            disabled={(!mockLoginEnabled && (!phoneValid || !codeValid)) || submitting}
            className="w-full mt-2 flex items-center justify-center rounded-xl bg-[#EF6B00] px-4 py-4 text-sm font-medium text-white hover:bg-[#D85F00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.99]"
          >
            {submitting ? '验证中…' : '登录并进入工作台'}
          </button>

          {mockLoginEnabled && (
            <button
              type="button"
              onClick={onSuccess}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              开发模式：直接登录 (跳过验证)
            </button>
          )}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
              返回
            </button>
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
