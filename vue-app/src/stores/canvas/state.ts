// ===== 画布状态层 =====
// 承载所有 fabric.Canvas 相关响应式状态与计算属性
// - fabric 实例使用 shallowRef 持有 (避免深度响应拖慢性能)
// - 响应式 UI 状态使用 ref/reactive
// - 历史栈 (撤销/重做) 按平台独立维护
import type { ActiveProps, BgFitMode, Platform } from '@/types';
import { FILL_PRESET_COLORS } from '@/utils/constants';
import { computed, reactive, ref, shallowRef } from 'vue';

// fabric 实例类型 (宽松类型, 避免与 fabric 内部类型摩擦)
export type FabricCanvas = any;
export type FabricObject = any;

export function useCanvasState() {
  // ===== Fabric 实例 (非深度响应) =====
  const canvases = shallowRef<Record<Platform, FabricCanvas | null>>({
    bilibili: null,
    douyin: null,
  });
  const canvasBackgroundImages = shallowRef<Record<Platform, any>>({
    bilibili: null,
    douyin: null,
  });
  const clipboard = shallowRef<any>(null);

  // ===== 平台与缩放 =====
  const activePlatform = ref<Platform>('bilibili');
  const bilibiliScale = ref(0.4);
  const douyinScale = ref(0.4);

  // ===== 选中元素状态 =====
  const activeObject = shallowRef<FabricObject>(null);
  const isText = ref(false);
  const isImage = ref(false);
  const hasColor = ref(false);

  // ===== 共享背景状态 (两个画布完全同步) =====
  const canvasBg = ref('#FFFFFF');
  const bgOpacity = ref(1);
  const sharedBgImageUrl = ref<string | null>(null);
  const bgFitMode = ref<BgFitMode>('stretch');

  // ===== 历史栈 (各平台独立) =====
  const undoStacks = reactive<Record<Platform, string[]>>({
    bilibili: [],
    douyin: [],
  });
  const redoStacks = reactive<Record<Platform, string[]>>({
    bilibili: [],
    douyin: [],
  });
  const isProcessingHistory = ref(false);

  // ===== 选中元素属性镜像 =====
  const activeProps = reactive<ActiveProps>({
    fill: '#FEC000',
    fontSize: 192,
    opacity: 1,
    textValue: '',
    fontFamily: '-apple-system',
  });

  const fillPresetColors = FILL_PRESET_COLORS;

  // ===== 计算属性 =====
  const currentCanvas = computed(() => canvases.value[activePlatform.value]);
  const currentUndoStack = computed(() => undoStacks[activePlatform.value]);
  const currentRedoStack = computed(() => redoStacks[activePlatform.value]);
  const canUndo = computed(() => currentUndoStack.value.length > 0);
  const canRedo = computed(() => currentRedoStack.value.length > 0);
  const canGroup = computed(
    () => activeObject.value && activeObject.value.type === 'activeSelection',
  );
  const canUngroup = computed(
    () => activeObject.value && activeObject.value.type === 'group',
  );

  return {
    // fabric 实例
    canvases,
    canvasBackgroundImages,
    clipboard,
    // 平台与缩放
    activePlatform,
    bilibiliScale,
    douyinScale,
    // 选中元素
    activeObject,
    isText,
    isImage,
    hasColor,
    // 共享背景
    canvasBg,
    bgOpacity,
    sharedBgImageUrl,
    bgFitMode,
    // 历史栈
    undoStacks,
    redoStacks,
    isProcessingHistory,
    // 属性镜像
    activeProps,
    fillPresetColors,
    // 计算
    currentCanvas,
    currentUndoStack,
    currentRedoStack,
    canUndo,
    canRedo,
    canGroup,
    canUngroup,
  };
}

export type CanvasState = ReturnType<typeof useCanvasState>;
