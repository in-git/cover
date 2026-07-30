// ===== 背景图适配计算 =====
import type { BgFitMode, CanvasDims } from '@/types'

/**
 * 根据适配模式计算背景图的 scale 与居中位置
 * - stretch: 拉伸填满 (可能变形)
 * - contain: 原比例完整显示 (留白)
 * - cover:   原比例覆盖填满 (裁剪)
 */
export function calcBgImgProps(
  imgWidth: number,
  imgHeight: number,
  dims: CanvasDims,
  mode: BgFitMode
): { scaleX: number; scaleY: number; left: number; top: number } {
  let scaleX: number, scaleY: number, left = 0, top = 0
  if (mode === 'stretch') {
    scaleX = dims.w / imgWidth
    scaleY = dims.h / imgHeight
  } else if (mode === 'contain') {
    const scale = Math.min(dims.w / imgWidth, dims.h / imgHeight)
    scaleX = scaleY = scale
    left = (dims.w - imgWidth * scale) / 2
    top = (dims.h - imgHeight * scale) / 2
  } else {
    // cover
    const scale = Math.max(dims.w / imgWidth, dims.h / imgHeight)
    scaleX = scaleY = scale
    left = (dims.w - imgWidth * scale) / 2
    top = (dims.h - imgHeight * scale) / 2
  }
  return { scaleX, scaleY, left, top }
}
