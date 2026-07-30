// ===== 画布主 store =====
// 组合 state/history/selection/background/template/objects/export 各层
// 拆分自原 canvas.ts (与原版 setup() 逻辑 1:1 对应), 行为保持不变
// - fabric 实例使用 shallowRef 持有 (避免深度响应拖慢性能)
// - 响应式 UI 状态使用 ref/reactive
// - 历史栈 (撤销/重做) 按平台独立维护
import { defineStore } from 'pinia';
import { useCanvasBackground } from './background';
import { useCanvasExport } from './export';
import { useCanvasHistory } from './history';
import { useCanvasObjects } from './objects';
import { useCanvasSelection } from './selection';
import { useCanvasState } from './state';
import { useCanvasTemplate } from './template';

export const useCanvasStore = defineStore('canvas', () => {
  // 状态层: 所有响应式状态与计算属性
  const state = useCanvasState();
  // 历史层: 撤销/重做 + 模板自动同步
  const history = useCanvasHistory(state);
  // 选中层: 选中回调 + 编组/图层/复制粘贴 (选中元素时自动切到组件配置 tab)
  const selection = useCanvasSelection(state, history);
  // 背景层: 共享背景同步到两个画布
  const background = useCanvasBackground(state, history);
  // 组件层: 添加组件 + 属性更新 + 字体应用
  const objects = useCanvasObjects(state, history);
  // 模板层: 画布初始化 + 模板加载 (依赖 background + selection)
  const template = useCanvasTemplate(state, history, background, selection);
  // 导出层: PNG 导出 + 释放实例
  const exportMod = useCanvasExport(state);

  return {
    // ===== 状态 =====
    ...state,
    // ===== 历史 =====
    ...history,
    // ===== 选中/编组/图层 =====
    ...selection,
    // ===== 背景 =====
    ...background,
    // ===== 组件/属性/字体 =====
    ...objects,
    // ===== 模板/画布初始化 =====
    ...template,
    // ===== 导出 =====
    ...exportMod,
  };
});

// 类型再导出 (供其他模块使用)
export type { CanvasBackground } from './background';
export type { CanvasExport } from './export';
export type { CanvasHistory } from './history';
export type { CanvasObjects } from './objects';
export type { CanvasSelection } from './selection';
export type { CanvasState, FabricCanvas, FabricObject } from './state';
export type { CanvasTemplate } from './template';
