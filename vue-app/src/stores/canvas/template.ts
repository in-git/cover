// ===== 模板层 =====
// fabric.Canvas 实例初始化 + 模板加载 + 双画布缩放计算
import { useTemplateStore } from '@/stores/template';
import { useUiStore } from '@/stores/ui';
import type { Platform } from '@/types';
import { fabric } from '@/utils/fabric';
import type { CanvasBackground } from './background';
import type { CanvasHistory } from './history';
import type { CanvasSelection } from './selection';
import type { CanvasSnapping } from './snapping';
import type { CanvasState } from './state';

export function useCanvasTemplate(
  state: CanvasState,
  history: CanvasHistory,
  background: CanvasBackground,
  selection: CanvasSelection,
  snapping: CanvasSnapping,
) {
  const templateStore = useTemplateStore();
  const {
    canvases,
    activePlatform,
    isProcessingHistory,
    canvasBg,
    bgOpacity,
    sharedBgImageUrl,
    bgFitMode,
    undoStacks,
    redoStacks,
    activeObject,
  } = state;
  const {
    saveHistoryState,
    autoSaveTemplate,
    clearExistingBgImages,
    serializeCanvas,
  } = history;
  const { applyBackgroundToBoth } = background;
  const { handleSelection } = selection;
  const uiStore = useUiStore();

  // ===== 同时计算两个画布的缩放 (横竖屏比例不同) =====
  function handleResize(mainAreaEl: HTMLElement | null): void {
    if (!mainAreaEl) return;
    const availableW = mainAreaEl.clientWidth - 40;
    const availableH = mainAreaEl.clientHeight - 140;
    state.bilibiliScale.value = Math.min(
      availableW / 1920,
      availableH / 1080,
      0.75,
    );
    state.douyinScale.value = Math.min(
      availableW / 1080,
      availableH / 1920,
      0.45,
    );
  }

  // ===== 初始化单个 fabric.Canvas 实例 =====
  function initCanvasInstance(
    platform: Platform,
    dims: { w: number; h: number },
  ): void {
    const c = new fabric.Canvas(`${platform}Canvas`, {
      width: dims.w,
      height: dims.h,
      backgroundColor: canvasBg.value,
      preserveObjectStacking: true,
    });
    c.on('selection:created', handleSelection);
    c.on('selection:updated', handleSelection);
    c.on('selection:cleared', () => {
      if (activePlatform.value === platform) {
        activeObject.value = null;
        uiStore.setTab('background');
      }
    });
    // 辅助线 (isGuideLine) 是临时对象, 不计入历史栈, 避免拖动时污染撤销
    c.on('object:added', (e: any) => {
      if (e?.target?.isGuideLine) return;
      if (activePlatform.value === platform) saveHistoryState();
    });
    c.on('object:removed', (e: any) => {
      if (e?.target?.isGuideLine) return;
      if (activePlatform.value === platform) saveHistoryState();
    });
    c.on('object:modified', () => {
      if (activePlatform.value === platform) {
        saveHistoryState();
        autoSaveTemplate();
      }
    });
    // 挂载拖动吸附 (画布边缘/中心 + 其他组件边缘/中心)
    snapping.attachSnapping(c, platform, dims);
    canvases.value[platform] = c;
  }

  // ===== 加载模板到两个画布 (B站 + 抖音) =====
  function loadTemplate(tpl: any): void {
    templateStore.currentTemplateId = tpl.id;
    isProcessingHistory.value = true;

    // 共享背景状态恢复
    canvasBg.value = tpl.bgColor || tpl.bgPreview || '#FFFFFF';
    bgOpacity.value = tpl.bgImageOpacity ?? 1;
    sharedBgImageUrl.value = tpl.bgImageUrl || null;
    bgFitMode.value = tpl.bgFitMode || 'stretch';

    // 清空两个画布的历史栈
    undoStacks.bilibili.length = 0;
    undoStacks.douyin.length = 0;
    redoStacks.bilibili.length = 0;
    redoStacks.douyin.length = 0;

    let pendingLoads = 2;
    const onPlatformLoaded = () => {
      pendingLoads--;
      if (pendingLoads === 0) {
        if (tpl.bgImageUrl) {
          applyBackgroundToBoth(tpl.bgImageUrl, tpl.bgImageOpacity ?? 1);
        }
        setTimeout(() => {
          isProcessingHistory.value = false;
          (['bilibili', 'douyin'] as Platform[]).forEach((p) => {
            const c = canvases.value[p];
            if (!c) return;
            undoStacks[p] = [JSON.stringify(serializeCanvas(c))];
            redoStacks[p] = [];
          });
        }, 200);
      }
    };

    const loadPlatform = (platform: Platform) => {
      const c = canvases.value[platform];
      if (!c) {
        onPlatformLoaded();
        return;
      }
      const json = tpl[`${platform}_json`] || {
        background: canvasBg.value,
        objects: [],
      };
      clearExistingBgImages(platform);
      c.loadFromJSON(json, () => {
        c.setBackgroundColor(canvasBg.value, c.renderAll.bind(c));
        c.discardActiveObject();
        c.renderAll();
        onPlatformLoaded();
      });
    };

    loadPlatform('bilibili');
    loadPlatform('douyin');
  }

  // ===== 新增空白模板 (委托 template store, 然后加载) =====
  function createEmptyTemplate(): void {
    const emptyTpl = templateStore.createEmptyTemplate();
    loadTemplate(emptyTpl);
  }

  return {
    handleResize,
    initCanvasInstance,
    loadTemplate,
    createEmptyTemplate,
  };
}

export type CanvasTemplate = ReturnType<typeof useCanvasTemplate>;
