// ===== 吸附对齐层 =====
// 拖动组件时, 自动吸附到画布边缘/中心 及其他组件的边缘/中心
// 并显示蓝色辅助线 (isGuideLine=true, 序列化与选中时已自动过滤)
// - 仅在 object:moving 时生效 (移动吸附), 阈值 6px (画布坐标系)
// - 辅助线为临时 fabric.Line, mouse:up 后清除, 不污染历史栈
import type { CanvasDims, Platform } from '@/types';
import { fabric } from '@/utils/fabric';
import { ref } from 'vue';

/** 吸附阈值 (画布坐标系内的像素距离) */
const SNAP_THRESHOLD = 6;
/** 辅助线颜色 (与选中边框一致的强调蓝) */
const GUIDE_COLOR = '#0071e3';
const GUIDE_STROKE = 2;

export function useCanvasSnapping() {
  /** 吸附开关 (默认开启, 由底部工具栏磁铁按钮切换) */
  const snapEnabled = ref(true);

  // 每个画布的事件句柄 (用于卸载), fabric.Canvas 实例为 object 键
  const handlerMap = new WeakMap<any, { moving: (e: any) => void; up: () => void }>();

  /** 创建一条辅助线 (v=垂直 x=pos, h=水平 y=pos) */
  function createGuide(
    orientation: 'v' | 'h',
    pos: number,
    canvasW: number,
    canvasH: number,
  ): any {
    const coords =
      orientation === 'v' ? [pos, 0, pos, canvasH] : [0, pos, canvasW, pos];
    return new fabric.Line(coords, {
      stroke: GUIDE_COLOR,
      strokeWidth: GUIDE_STROKE,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      isGuideLine: true,
      hoverCursor: 'default',
      objectCaching: false,
    });
  }

  /** 清除画布上所有辅助线 */
  function clearGuides(c: any): void {
    const guides = c.getObjects().filter((o: any) => o.isGuideLine);
    if (!guides.length) return;
    guides.forEach((g: any) => c.remove(g));
  }

  /** 给 fabric.Canvas 实例挂载吸附监听 (在 initCanvasInstance 中调用) */
  function attachSnapping(c: any, _platform: Platform, dims: CanvasDims): void {
    const canvasW = dims.w;
    const canvasH = dims.h;
    // 当前已显示的辅助线位置 (避免每帧重建, 仅在吸附目标变化时刷新)
    let curV: number | null = null;
    let curH: number | null = null;

    /** 在一组目标点中, 找到与吸附点最近的吸附位移 (未命中返回 null) */
    function findSnap(
      points: number[],
      targets: number[],
    ): { delta: number; pos: number } | null {
      let bestDelta: number | null = null;
      let pos: number | null = null;
      for (const p of points) {
        for (const t of targets) {
          const d = t - p;
          if (
            Math.abs(d) <= SNAP_THRESHOLD &&
            (bestDelta === null || Math.abs(d) < Math.abs(bestDelta))
          ) {
            bestDelta = d;
            pos = t;
          }
        }
      }
      return pos === null ? null : { delta: bestDelta as number, pos };
    }

    const moving = (e: any): void => {
      if (!snapEnabled.value) {
        if (curV !== null || curH !== null) {
          clearGuides(c);
          curV = null;
          curH = null;
        }
        return;
      }
      const obj = e.target;
      if (!obj || obj.isBackgroundImage || obj.isGuideLine) return;

      // getBoundingRect 用 lineCoords (含描边, 不含 padding), 边缘吸附精确
      obj.setCoords();
      const b = obj.getBoundingRect();
      const xPoints = [b.left, b.left + b.width / 2, b.left + b.width];
      const yPoints = [b.top, b.top + b.height / 2, b.top + b.height];

      // 收集吸附目标点: 画布边缘/中心 + 其他组件(独立对象)的边缘/中心
      const targetXs: number[] = [0, canvasW / 2, canvasW];
      const targetYs: number[] = [0, canvasH / 2, canvasH];
      c.getObjects().forEach((o: any) => {
        if (o === obj || o.isGuideLine || o.isBackgroundImage || o.group) return;
        o.setCoords();
        const ob = o.getBoundingRect();
        targetXs.push(ob.left, ob.left + ob.width / 2, ob.left + ob.width);
        targetYs.push(ob.top, ob.top + ob.height / 2, ob.top + ob.height);
      });

      const snapX = findSnap(xPoints, targetXs);
      const snapY = findSnap(yPoints, targetYs);

      // 应用吸附位移 (调整 left/top, 与对象 origin 无关: 平移量一致)
      if (snapX) {
        obj.left += snapX.delta;
        obj.setCoords();
      }
      if (snapY) {
        obj.top += snapY.delta;
        obj.setCoords();
      }

      // 仅在辅助线位置变化时重建 (减少 add/remove 调用)
      const nextV = snapX ? snapX.pos : null;
      const nextH = snapY ? snapY.pos : null;
      if (nextV !== curV || nextH !== curH) {
        clearGuides(c);
        if (nextV !== null) c.add(createGuide('v', nextV, canvasW, canvasH));
        if (nextH !== null) c.add(createGuide('h', nextH, canvasW, canvasH));
        curV = nextV;
        curH = nextH;
      }
      c.requestRenderAll();
    };

    const up = (): void => {
      if (curV !== null || curH !== null) {
        clearGuides(c);
        curV = null;
        curH = null;
        c.requestRenderAll();
      }
    };

    c.on('object:moving', moving);
    c.on('mouse:up', up);
    handlerMap.set(c, { moving, up });
  }

  /** 卸载吸附监听 + 清除残留辅助线 */
  function detachSnapping(c: any): void {
    const h = handlerMap.get(c);
    if (h) {
      c.off('object:moving', h.moving);
      c.off('mouse:up', h.up);
      handlerMap.delete(c);
    }
    clearGuides(c);
  }

  return { snapEnabled, attachSnapping, detachSnapping };
}

export type CanvasSnapping = ReturnType<typeof useCanvasSnapping>;
