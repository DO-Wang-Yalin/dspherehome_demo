/**
 * 注册/验证码 API
 *
 * 后端需提供（与 leads 同 base）：
 *
 * 1. 发送验证码
 *    POST {BASE}/auth/sms/send
 *    Body: { "phone": "13800138000" }
 *    成功: 200 { "success": true } 或 200 {}
 *    失败: 4xx + body 中 message 或 detail 作为错误文案
 *
 * 2. 验证并注册
 *    POST {BASE}/auth/register
 *    Body: { "phone": "13800138000", "code": "123456" }
 *    成功: 200 { "success": true } 或 200 { "token": "..." } 等
 *    失败: 4xx + body 中 message 或 detail 作为错误文案
 *
 * BASE = VITE_API_BASE_URL（默认 https://dreamone.cloud/api） + /dsphr/v1
 */

const AUTH_BASE =
  (import.meta.env.VITE_API_BASE_URL || 'https://dreamone.cloud/api')
    .replace(/\/$/, '') + '/dsphr/v1'

function getMessageFromErrorBody(body: unknown): string {
  if (!body || typeof body !== 'object') return '请求失败'
  const o = body as Record<string, unknown>
  if (typeof o.message === 'string') return o.message
  if (typeof o.detail === 'string') return o.detail
  if (typeof o.detail === 'object' && o.detail !== null) {
    const d = (o.detail as Record<string, unknown>).message ?? (o.detail as Record<string, unknown>).msg
    if (typeof d === 'string') return d
  }
  return '请求失败'
}

export interface SendSmsResult {
  success: boolean
  message?: string
}

export async function sendSmsCode(phone: string): Promise<SendSmsResult> {
  try {
    const res = await fetch(`${AUTH_BASE}/auth/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, message: getMessageFromErrorBody(body) || `发送失败: ${res.status}` }
    }
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `网络异常：${msg}` }
  }
}

export interface RegisterResult {
  success: boolean
  message?: string
}

export async function registerWithCode(phone: string, code: string): Promise<RegisterResult> {
  try {
    const res = await fetch(`${AUTH_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, message: getMessageFromErrorBody(body) || `注册失败: ${res.status}` }
    }
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `网络异常：${msg}` }
  }
}
