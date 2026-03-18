/**
 * 复制文本到剪贴板。
 * 1) 优先在点击回调内同步 execCommand（内网 HTTP、无 Clipboard 权限时常可用）
 * 2) 失败再用 Clipboard API
 */
function copyViaExecCommand(text: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('aria-hidden', 'true')
    ta.style.cssText =
      'position:fixed;left:-9999px;top:0;width:1px;height:1px;padding:0;border:none;outline:none;box-shadow:none;background:transparent'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false)

  if (copyViaExecCommand(text)) return Promise.resolve(true)

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    )
  }

  return Promise.resolve(false)
}
