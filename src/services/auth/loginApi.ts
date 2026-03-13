/**
 * 登录 API
 *
 * 后端需提供（与 register 同 base）：
 *
 * 1. 发送验证码：复用 auth/sms/send（见 registerApi）
 *
 * 2. 验证码登录
 *    POST {BASE}/auth/login
 *    Body: { "phone": "13800138000", "code": "123456" }
 *    成功: 200 { "success": true } 或 200 { "token": "..." }
 *    失败: 4xx + body 中 message 或 detail 作为错误文案
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

export interface LoginResult {
  success: boolean
  message?: string
}

export async function loginWithCode(phone: string, code: string): Promise<LoginResult> {
  try {
    const res = await fetch(`${AUTH_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, message: getMessageFromErrorBody(body) || `登录失败: ${res.status}` }
    }
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `网络异常：${msg}` }
  }
}
