// ===== 背景层 =====
// 共享背景同步到两个画布 (B站 + 抖音): 背景图/适配/透明度/背景色/上传
import type { BgFitMode, Platform } from '@/types';
import { calcBgImgProps } from '@/utils/background';
import { CANVAS_DIMS } from '@/utils/constants';
import { fabric } from '@/utils/fabric';
import { generateNoiseBackground } from '@/utils/noiseBackground';
import type { CanvasHistory } from './history';
import type { CanvasState } from './state';

export function useCanvasBackground(
  state: CanvasState,
  history: CanvasHistory,
) {
  const {
    canvases,
    canvasBackgroundImages,
    bgOpacity,
    sharedBgImageUrl,
    bgFitMode,
    canvasBg,
    activePlatform,
  } = state;
  const { saveHistoryState, autoSaveTemplate } = history;

  // ===== 背景同步到两个画布 =====
  function applyBackgroundToBoth(imgUrl: string, opacity?: number): void {
    sharedBgImageUrl.value = imgUrl;
    if (opacity !== undefined) bgOpacity.value = opacity;
    (['bilibili', 'douyin'] as Platform[]).forEach((platform) => {
      fabric.Image.fromURL(
        imgUrl,
        (fabricImg: any) => {
          const c = canvases.value[platform];
          if (!c) return;
          const dims = CANVAS_DIMS[platform];
          const existing = c
            .getObjects()
            .filter((o: any) => o.isBackgroundImage);
          existing.forEach((o: any) => c.remove(o));
          const fit = calcBgImgProps(
            fabricImg.width,
            fabricImg.height,
            dims,
            bgFitMode.value,
          );
          fabricImg.set({
            left: fit.left,
            top: fit.top,
            scaleX: fit.scaleX,
            scaleY: fit.scaleY,
            selectable: false,
            evented: false,
            isBackgroundImage: true,
            opacity: bgOpacity.value,
          });
          canvasBackgroundImages.value[platform] = fabricImg;
          c.add(fabricImg);
          c.sendToBack(fabricImg);
          c.renderAll();
        },
        { crossOrigin: 'anonymous' },
      );
    });
    saveHistoryState();
    autoSaveTemplate();
  }

  // ===== 切换背景适配模式 =====
  function setBgFitMode(mode: BgFitMode): void {
    bgFitMode.value = mode;
    if (!sharedBgImageUrl.value) return;
    (['bilibili', 'douyin'] as Platform[]).forEach((platform) => {
      const fabricImg = canvasBackgroundImages.value[platform];
      const c = canvases.value[platform];
      if (!fabricImg || !c) return;
      const dims = CANVAS_DIMS[platform];
      const fit = calcBgImgProps(fabricImg.width, fabricImg.height, dims, mode);
      fabricImg.set({
        left: fit.left,
        top: fit.top,
        scaleX: fit.scaleX,
        scaleY: fit.scaleY,
      });
      c.renderAll();
    });
    autoSaveTemplate();
  }

  function applyPublicBackground(bgUrl: string): void {
    applyBackgroundToBoth(bgUrl);
  }

  // ===== 资源应用到画布 (作为背景) =====
  function applyImageResource(url: string): void {
    applyBackgroundToBoth(url);
  }

  // ===== 生成 simplex 噪声背景并应用 (按当前平台比例生成, 避免拉伸变形) =====
  function applyNoiseBackground(): void {
    const dims = CANVAS_DIMS[activePlatform.value];
    // 输出尺寸保持与画布同比例, 1/4 分辨率 (480×270 或 270×480)
    // 背景图为柔和渐变, 放大后无明显锯齿, 同时控制生成耗时
    const ratio = dims.w / dims.h;
    const baseSize = 480;
    const w = ratio >= 1 ? baseSize : Math.round(baseSize * ratio);
    const h = ratio >= 1 ? Math.round(baseSize / ratio) : baseSize;
    const dataUrl = generateNoiseBackground(w, h);
    applyBackgroundToBoth(dataUrl, 1);
  }

  // ===== 画布背景色同步 =====
  function updateCanvasBg(): void {
    (['bilibili', 'douyin'] as Platform[]).forEach((platform) => {
      const c = canvases.value[platform];
      if (c) c.setBackgroundColor(canvasBg.value, c.renderAll.bind(c));
    });
    saveHistoryState();
    autoSaveTemplate();
  }

  // ===== 背景图透明度同步 =====
  function updateBgOpacity(): void {
    (['bilibili', 'douyin'] as Platform[]).forEach((platform) => {
      const bgImg = canvasBackgroundImages.value[platform];
      const c = canvases.value[platform];
      if (bgImg && c) {
        bgImg.set('opacity', bgOpacity.value);
        c.renderAll();
      }
    });
    autoSaveTemplate();
  }

  // ===== 背景图上传 (本地文件) =====
  function handleBgUpload(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      applyBackgroundToBoth(f.target!.result as string, 1);
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  return {
    applyBackgroundToBoth,
    setBgFitMode,
    applyPublicBackground,
    applyImageResource,
    applyNoiseBackground,
    updateCanvasBg,
    updateBgOpacity,
    handleBgUpload,
  };
}

export type CanvasBackground = ReturnType<typeof useCanvasBackground>;
