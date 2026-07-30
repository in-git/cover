// ===== 组件层 =====
// 添加各类组件 (文字/图形/线条/图标/毛玻璃) + 属性更新 + 图片替换 + 资源应用
import type { ActiveProps, ResourceItem } from '@/types';
import { CANVAS_DIMS } from '@/utils/constants';
import { fabric } from '@/utils/fabric';
import { ensureFontLoaded, fontPreviewFamily } from '@/utils/font';
import type { CanvasHistory } from './history';
import type { CanvasState } from './state';

export function useCanvasObjects(state: CanvasState, history: CanvasHistory) {
  const {
    activeObject,
    isText,
    isGlassCard,
    activeProps,
    glassProps,
    activePlatform,
    currentCanvas,
  } = state;
  const { saveHistoryState, autoSaveTemplate } = history;

  function updateActiveProp(prop: keyof ActiveProps): void {
    if (!activeObject.value) return;
    let val: any = activeProps[prop];
    if (prop === 'fontSize' || prop === 'opacity') val = Number(val);
    activeObject.value.set(prop, val);
    currentCanvas.value?.requestRenderAll();
    autoSaveTemplate();
  }

  function updateTextContent(): void {
    if (!activeObject.value || !isText.value) return;
    activeObject.value.set('text', activeProps.textValue);
    currentCanvas.value?.requestRenderAll();
    autoSaveTemplate();
  }

  function applyHotTitle(text: string): void {
    activeProps.textValue = text;
    updateTextContent();
  }

  function updateGlassProp(): void {
    if (!activeObject.value || !isGlassCard.value) return;
    activeObject.value.set({
      fill: glassProps.fill,
      stroke: glassProps.stroke,
    });
    currentCanvas.value?.requestRenderAll();
    autoSaveTemplate();
  }

  function setPresetColor(color: string): void {
    activeProps.fill = color;
    updateActiveProp('fill');
  }

  // ===== 添加组件 =====
  function addGlassCard(): void {
    const dims = CANVAS_DIMS[activePlatform.value];
    const w = Math.min(600, dims.w * 0.5);
    const h = Math.min(320, dims.h * 0.3);
    const rect = new fabric.Rect({
      left: (dims.w - w) / 2,
      top: (dims.h - h) / 2,
      width: w,
      height: h,
      fill: 'rgba(255, 255, 255, 0.2)',
      stroke: 'rgba(255, 255, 255, 0.6)',
      strokeWidth: 2,
      rx: 24,
      ry: 24,
    });
    currentCanvas.value.add(rect);
    currentCanvas.value.setActiveObject(rect);
    autoSaveTemplate();
  }

  function addText(): void {
    const dims = CANVAS_DIMS[activePlatform.value];
    const fontSize = activePlatform.value === 'douyin' ? 120 : 192;
    const text = new fabric.IText('输入爆款标题', {
      left: dims.w / 2,
      top: dims.h / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: '-apple-system',
      fill: '#FEC000',
      fontSize: fontSize,
      fontWeight: 'bold',
    });
    currentCanvas.value.add(text);
    currentCanvas.value.setActiveObject(text);
    autoSaveTemplate();
  }

  function addLine(): void {
    const dims = CANVAS_DIMS[activePlatform.value];
    const lineLen = Math.min(600, dims.w * 0.5);
    const line = new fabric.Line([0, 0, lineLen, 0], {
      left: dims.w / 2,
      top: dims.h / 2,
      originX: 'center',
      originY: 'center',
      stroke: '#00C0FF',
      strokeWidth: 10,
      strokeLineCap: 'round',
    });
    currentCanvas.value.add(line);
    currentCanvas.value.setActiveObject(line);
  }

  function addShape(): void {
    const dims = CANVAS_DIMS[activePlatform.value];
    const rect = new fabric.Rect({
      left: dims.w / 2,
      top: dims.h / 2,
      originX: 'center',
      originY: 'center',
      width: 320,
      height: 180,
      fill: '#FEC000',
      rx: 16,
      ry: 16,
    });
    currentCanvas.value.add(rect);
    currentCanvas.value.setActiveObject(rect);
  }

  function addIcon(): void {
    const dims = CANVAS_DIMS[activePlatform.value];
    const starPath =
      'M 12 2 L 15.09 8.26 L 22 9.27 L 17 14.14 L 18.18 21.02 L 12 17.77 L 5.82 21.02 L 7 14.14 L 2 9.27 L 8.91 8.26 Z';
    const icon = new fabric.Path(starPath, {
      left: dims.w / 2,
      top: dims.h / 2,
      originX: 'center',
      originY: 'center',
      fill: '#0071e3',
      scaleX: 6,
      scaleY: 6,
    });
    currentCanvas.value.add(icon);
    currentCanvas.value.setActiveObject(icon);
  }

  // ===== 图片上传 / 替换 =====
  function handleImageUpload(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target!.result as string, (img: any) => {
        const dims = CANVAS_DIMS[activePlatform.value];
        img.scaleToWidth(Math.min(600, dims.w * 0.5));
        img.set({
          left: dims.w / 2,
          top: dims.h / 2,
          originX: 'center',
          originY: 'center',
        });
        currentCanvas.value.add(img);
        currentCanvas.value.setActiveObject(img);
      });
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  function handleReplaceImage(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !activeObject.value) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target!.result as string, (newImg: any) => {
        const activeObj = activeObject.value;
        newImg.set({
          left: activeObj.left,
          top: activeObj.top,
          originX: activeObj.originX,
          originY: activeObj.originY,
          scaleX: activeObj.scaleX,
          scaleY: activeObj.scaleY,
          angle: activeObj.angle,
          opacity: activeObj.opacity,
        });
        currentCanvas.value.remove(activeObj);
        currentCanvas.value.add(newImg);
        currentCanvas.value.setActiveObject(newImg);
        saveHistoryState();
        autoSaveTemplate();
      });
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  // ===== 应用字体到当前选中文字 (返回是否成功) =====
  // 供 ComponentPanel 字体选择器调用: 不弹窗, 不关闭任何面板
  function applyFontToActive(font: ResourceItem): boolean {
    ensureFontLoaded(font);
    const family = fontPreviewFamily(font.name);
    const obj = activeObject.value;
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('fontFamily', family);
      activeProps.fontFamily = family;
      currentCanvas.value && currentCanvas.value.requestRenderAll();
      autoSaveTemplate();
      return true;
    }
    return false;
  }

  // ===== 重置当前文字为系统默认字体 (-apple-system) =====
  function resetFontToSystem(): void {
    const obj = activeObject.value;
    if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
      obj.set('fontFamily', '-apple-system');
      activeProps.fontFamily = '-apple-system';
      currentCanvas.value && currentCanvas.value.requestRenderAll();
      autoSaveTemplate();
    }
  }

  // ===== 应用字体到当前选中文字 (ResourceManager 调用, 完成后关闭弹窗) =====
  function applyFontResource(
    font: ResourceItem,
    closeCallback: () => void,
  ): void {
    if (applyFontToActive(font)) {
      closeCallback();
    } else {
      alert('请先在画布中选中一个文字元素, 再应用字体');
    }
  }

  return {
    updateActiveProp,
    updateTextContent,
    applyHotTitle,
    updateGlassProp,
    setPresetColor,
    addGlassCard,
    addText,
    addLine,
    addShape,
    addIcon,
    handleImageUpload,
    handleReplaceImage,
    applyFontToActive,
    resetFontToSystem,
    applyFontResource,
  };
}

export type CanvasObjects = ReturnType<typeof useCanvasObjects>;
