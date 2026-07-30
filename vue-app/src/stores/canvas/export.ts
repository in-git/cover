// ===== 导出层 =====
// 画布导出为 PNG (单平台 / 双平台) + 释放 fabric 实例
import type { CanvasState } from './state';
import type { Platform } from '@/types';

export function useCanvasExport(state: CanvasState) {
  const { canvases, activePlatform } = state;

  function exportCanvasToFile(canvasInstance: any, filename: string): void {
    if (!canvasInstance) return;
    canvasInstance.discardActiveObject();
    const guides = canvasInstance
      .getObjects()
      .filter((o: any) => o.isGuideLine || o.isSafetyGuide);
    guides.forEach((g: any) => g.set('visible', false));
    canvasInstance.renderAll();
    const dataURL = canvasInstance.toDataURL({ format: 'png', multiplier: 1 });
    guides.forEach((g: any) => g.set('visible', true));
    canvasInstance.renderAll();
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  }

  function exportCurrent(): void {
    const plat: Platform = activePlatform.value;
    exportCanvasToFile(canvases.value[plat], `${plat}.png`);
  }

  async function exportBoth(): Promise<void> {
    if (canvases.value.bilibili) {
      exportCanvasToFile(canvases.value.bilibili, 'bilibili.png');
    }
    await new Promise((r) => setTimeout(r, 300));
    if (canvases.value.douyin) {
      exportCanvasToFile(canvases.value.douyin, 'douyin.png');
    }
  }

  // ===== 释放 fabric 实例 =====
  function dispose(): void {
    Object.values(canvases.value).forEach(
      (c: any) => c && c.dispose && c.dispose(),
    );
  }

  return {
    exportCanvasToFile,
    exportCurrent,
    exportBoth,
    dispose,
  };
}

export type CanvasExport = ReturnType<typeof useCanvasExport>;
