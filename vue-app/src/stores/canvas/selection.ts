// ===== 选中层 =====
// 选中元素回调 (含右侧 tab 切换) + 编组/图层/复制粘贴/平台切换/删除
import { useUiStore } from '@/stores/ui';
import type { Platform } from '@/types';
import { nextTick } from 'vue';
import type { CanvasHistory } from './history';
import type { CanvasState } from './state';

export function useCanvasSelection(state: CanvasState, history: CanvasHistory) {
  const uiStore = useUiStore();
  const {
    activeObject,
    isText,
    isImage,
    isGlassCard,
    hasColor,
    activeProps,
    glassProps,
    activePlatform,
    currentCanvas,
    clipboard,
    canvasBackgroundImages,
  } = state;
  const { saveHistoryState, autoSaveTemplate } = history;

  // ===== 选中元素回调 =====
  // 选中有效元素时: 镜像属性 + 自动切换右侧到「组件配置」tab
  function handleSelection(e: any): void {
    const c = currentCanvas.value;
    const obj = e.selected ? e.selected[0] : c ? c.getActiveObject() : null;
    if (!obj || obj.isGuideLine || obj.isBackgroundImage) {
      activeObject.value = null;
      return;
    }
    activeObject.value = obj;
    isText.value = obj.type === 'i-text' || obj.type === 'text';
    isImage.value = obj.type === 'image';
    isGlassCard.value = !!obj.isGlassCard;
    hasColor.value =
      !isImage.value && obj.type !== 'group' && !isGlassCard.value;

    activeProps.fill = obj.fill || obj.stroke || '#FEC000';
    activeProps.opacity = obj.opacity ?? 1;
    if (isText.value) {
      activeProps.fontSize = obj.fontSize || 192;
      activeProps.textValue = obj.text || '';
      activeProps.fontFamily = obj.fontFamily || '-apple-system';
    }
    if (isGlassCard.value) {
      glassProps.fill = obj.fill || 'rgba(255, 255, 255, 0.25)';
      glassProps.stroke = obj.stroke || 'rgba(255, 255, 255, 0.5)';
    }

    // 点击组件自动切换右侧到「组件配置」面板, 并收起爆款标题弹出层
    uiStore.setTab('component');
    uiStore.showHotTitles = false;
    uiStore.showFontPicker = false;
  }

  // ===== 复制 / 粘贴 =====
  function copyActiveObject(): void {
    const c = currentCanvas.value;
    if (!c) return;
    const active = c.getActiveObject();
    if (!active || active.isBackgroundImage || active.isGuideLine) return;
    active.clone((cloned: any) => {
      clipboard.value = cloned;
    });
  }

  function pasteObject(): void {
    const c = currentCanvas.value;
    if (!clipboard.value || !c) return;
    clipboard.value.clone((cloned: any) => {
      c.discardActiveObject();
      cloned.set({
        left: cloned.left + 30,
        top: cloned.top + 30,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = c;
        cloned.forEachObject((obj: any) => c.add(obj));
        cloned.setCoords();
      } else {
        c.add(cloned);
      }
      c.setActiveObject(cloned);
      c.requestRenderAll();
      saveHistoryState();
      autoSaveTemplate();
    });
  }

  // ===== 平台切换 =====
  function switchPlatform(platform: Platform): void {
    if (platform === activePlatform.value) return;
    activeObject.value = null;
    activePlatform.value = platform;
    nextTick(() => {
      const c = state.canvases.value[platform];
      if (c) {
        c.renderAll();
        c.discardActiveObject();
      }
    });
  }

  // ===== 编组 / 取消编组 =====
  function groupObjects(): void {
    const c = currentCanvas.value;
    if (!c) return;
    const activeObj = c.getActiveObject();
    if (!activeObj || activeObj.type !== 'activeSelection') return;
    activeObj.toGroup();
    c.requestRenderAll();
    handleSelection({ selected: [c.getActiveObject()] });
    saveHistoryState();
    autoSaveTemplate();
  }

  function ungroupObjects(): void {
    const c = currentCanvas.value;
    if (!c) return;
    const activeObj = c.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') return;
    activeObj.toActiveSelection();
    c.requestRenderAll();
    handleSelection({ selected: [c.getActiveObject()] });
    saveHistoryState();
    autoSaveTemplate();
  }

  // ===== 图层管理 =====
  function bringToFront(): void {
    if (activeObject.value && !activeObject.value.isBackgroundImage) {
      activeObject.value.bringToFront();
      const bgImg = canvasBackgroundImages.value[activePlatform.value];
      if (bgImg) bgImg.sendToBack();
      saveHistoryState();
      autoSaveTemplate();
    }
  }

  function sendToBack(): void {
    if (activeObject.value && !activeObject.value.isBackgroundImage) {
      activeObject.value.sendToBack();
      const bgImg = canvasBackgroundImages.value[activePlatform.value];
      if (bgImg) bgImg.sendToBack();
      saveHistoryState();
      autoSaveTemplate();
    }
  }

  function deleteObject(): void {
    const c = currentCanvas.value;
    if (!c) return;
    const active = c.getActiveObjects();
    if (active && active.length) {
      active.forEach((obj: any) => {
        if (!obj.isGuideLine && !obj.isBackgroundImage) c.remove(obj);
      });
      c.discardActiveObject();
      activeObject.value = null;
      c.requestRenderAll();
      saveHistoryState();
      autoSaveTemplate();
    }
  }

  return {
    handleSelection,
    copyActiveObject,
    pasteObject,
    switchPlatform,
    groupObjects,
    ungroupObjects,
    bringToFront,
    sendToBack,
    deleteObject,
  };
}

export type CanvasSelection = ReturnType<typeof useCanvasSelection>;
