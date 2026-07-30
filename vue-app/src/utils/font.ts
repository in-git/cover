// ===== 字体动态注入工具 =====
// 根据字体文件名生成唯一 family 名 (用于 @font-face 注入)
import type { ResourceItem } from '@/types'
import { FONT_FORMAT_MAP } from './constants'

// 已动态注入的字体 family 集合 (避免重复加载) - 模块级单例, 非响应式
const loadedFontFamilies = new Set<string>()

export function fontPreviewFamily(filename: string): string {
  const base = (filename || 'font').replace(/\.[^.]+$/, '')
  return `RM_${base.replace(/[^A-Za-z0-9_\u4e00-\u9fa5]/g, '_')}`
}

/** 动态注入 @font-face, 让字体在浏览器中可用 */
export function ensureFontLoaded(font: ResourceItem): void {
  const family = fontPreviewFamily(font.name)
  if (loadedFontFamilies.has(family)) return
  const fmt = FONT_FORMAT_MAP[font.ext] || 'truetype'
  const css = `@font-face { font-family: "${family}"; src: url("${font.url}") format("${fmt}"); font-display: swap; }`
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  loadedFontFamilies.add(family)
}
