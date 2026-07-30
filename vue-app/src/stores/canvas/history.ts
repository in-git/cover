// ===== 历史栈层 =====
// 撤销/重做栈 + 画布状态自动同步到模板 (按平台独立维护)
import { useTemplateStore } from '@/stores/template';
import type { Platform } from '@/types';
import type { CanvasState } from './state';

export function useCanvasHistory(state: CanvasState) {
  const templateStore = useTemplateStore();
  const {
    currentCanvas,
    isProcessingHistory,
    undoStacks,
    redoStacks,
    activePlatform,
    canvasBg,
    bgOpacity,
    sharedBgImageUrl,
    bgFitMode,
    canvasBackgroundImages,
    currentUndoStack,
    currentRedoStack,
    canUndo,
    canRedo,
  } = state;

  /** 序列化当前画布 (过滤掉引导线与背景图) */
  function serializeCanvas(c: any): any {
    const json = c.toJSON(['isBackgroundImage']);
    if (json.objects) {
      json.objects = json.objects.filter(
        (obj: any) =>
          obj.isGuideLine !== true && obj.isBackgroundImage !== true,
      );
    }
    return json;
  }

  // ===== 历史状态保存 =====
  function saveHistoryState(): void {
    const c = currentCanvas.value;
    if (isProcessingHistory.value || !c) return;
    currentUndoStack.value.push(JSON.stringify(serializeCanvas(c)));
    currentRedoStack.value.length = 0;
  }

  // ===== 自动保存当前画布到模板对应平台的 json 字段 =====
  function autoSaveTemplate(): void {
    const c = currentCanvas.value;
    if (
      isProcessingHistory.value ||
      !c ||
      templateStore.currentTemplateId === null
    )
      return;
    templateStore.syncTemplateFromCanvas(
      activePlatform.value,
      serializeCanvas(c),
      {
        color: canvasBg.value || '#FFFFFF',
        imageUrl: sharedBgImageUrl.value,
        opacity: bgOpacity.value,
        fitMode: bgFitMode.value,
      },
    );
  }

  // ===== 清除指定平台画布的背景图 =====
  function clearExistingBgImages(platform?: Platform): void {
    const p = platform || activePlatform.value;
    const c = state.canvases.value[p];
    if (!c) return;
    const existing = c.getObjects().filter((obj: any) => obj.isBackgroundImage);
    existing.forEach((obj: any) => c.remove(obj));
    canvasBackgroundImages.value[p] = null;
  }

  /** 在撤销/重做后恢复背景图到画布底层 */
  function restoreBgImageAfterLoad(platform: Platform): void {
    const c = state.canvases.value[platform];
    const bgImg = canvasBackgroundImages.value[platform];
    if (c && bgImg) {
      c.add(bgImg);
      c.sendToBack(bgImg);
    }
  }

  function undo(): void {
    const c = currentCanvas.value;
    if (!canUndo.value || !c) return;
    isProcessingHistory.value = true;
    const prevJson = currentUndoStack.value.pop();
    currentRedoStack.value.push(JSON.stringify(serializeCanvas(c)));
    c.loadFromJSON(prevJson, () => {
      restoreBgImageAfterLoad(activePlatform.value);
      c.discardActiveObject();
      c.renderAll();
      isProcessingHistory.value = false;
      autoSaveTemplate();
    });
  }

  function redo(): void {
    const c = currentCanvas.value;
    if (!canRedo.value || !c) return;
    isProcessingHistory.value = true;
    const nextJson = currentRedoStack.value.pop();
    currentUndoStack.value.push(JSON.stringify(serializeCanvas(c)));
    c.loadFromJSON(nextJson, () => {
      restoreBgImageAfterLoad(activePlatform.value);
      c.discardActiveObject();
      c.renderAll();
      isProcessingHistory.value = false;
      autoSaveTemplate();
    });
  }

  return {
    saveHistoryState,
    autoSaveTemplate,
    clearExistingBgImages,
    restoreBgImageAfterLoad,
    serializeCanvas,
    undo,
    redo,
  };
}

export type CanvasHistory = ReturnType<typeof useCanvasHistory>;
