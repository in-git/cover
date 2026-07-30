// ===== 组件层 =====
// 添加各类组件 (文字/图形/线条) + 属性更新 + 图片拖拽生成 + 图片替换 + 资源应用
import type { ActiveProps, ResourceItem } from '@/types';
import { CANVAS_DIMS } from '@/utils/constants';
import { fabric } from '@/utils/fabric';
import { ensureFontLoaded, fontPreviewFamily } from '@/utils/font';
import type { CanvasHistory } from './history';
import type { CanvasState } from './state';

export function useCanvasObjects(state: CanvasState, history: CanvasHistory) {
  const { activeObject, isText, activeProps, activePlatform, currentCanvas } =
    state;
  const { saveHistoryState, autoSaveTemplate } = history;

  function updateActiveProp(prop: keyof ActiveProps): void {
    if (!activeObject.value) return;
    let val: any = activeProps[prop];
    if (prop === 'fontSize' || prop === 'opacity' || prop === 'angle')
      val = Number(val);
    // 分割线 (fabric.Line) 颜色由 stroke 控制, fill 不参与渲染, 需同步到 stroke
    if (prop === 'fill' && activeObject.value.type === 'line') {
      activeObject.value.set('stroke', val);
    } else {
      activeObject.value.set(prop, val);
    }
    activeObject.value.setCoords();
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

  function setPresetColor(color: string): void {
    activeProps.fill = color;
    updateActiveProp('fill');
  }

  // ===== 添加组件 =====
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

  // ===== 拖拽图片到画布: 生成图片组件 (本地上传至画布, 不上传服务器) =====
  // pointer 为画布坐标系 (0..dims.w / 0..dims.h) 的落点, 缺省则居中
  function addImageFiles(
    files: File[],
    pointer?: { x: number; y: number },
  ): void {
    const c = currentCanvas.value;
    if (!c) return;
    const dims = CANVAS_DIMS[activePlatform.value];
    const images = files.filter((f) => f.type.startsWith('image/'));
    images.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target!.result as string, (img: any) => {
          img.scaleToWidth(Math.min(600, dims.w * 0.5));
          const baseLeft = pointer ? pointer.x : dims.w / 2;
          const baseTop = pointer ? pointer.y : dims.h / 2;
          img.set({
            left: baseLeft + i * 30,
            top: baseTop + i * 30,
            originX: 'center',
            originY: 'center',
          });
          c.add(img);
          c.setActiveObject(img);
          c.requestRenderAll();
          saveHistoryState();
          autoSaveTemplate();
        });
      };
      reader.readAsDataURL(file);
    });
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

  // ===== 居中对齐 (基于 fabric canvas 逻辑尺寸 1920×1080 / 1080×1920) =====
  // fabric 的 centerH/centerV 会自动处理 originX/originY, scale 由 CSS transform 控制, 不影响坐标
  function centerObjectH(): void {
    const obj = activeObject.value;
    const c = currentCanvas.value;
    if (!obj || !c) return;
    obj.centerH();
    obj.setCoords();
    c.requestRenderAll();
    saveHistoryState();
    autoSaveTemplate();
  }

  function centerObjectV(): void {
    const obj = activeObject.value;
    const c = currentCanvas.value;
    if (!obj || !c) return;
    obj.centerV();
    obj.setCoords();
    c.requestRenderAll();
    saveHistoryState();
    autoSaveTemplate();
  }

  return {
    updateActiveProp,
    updateTextContent,
    applyHotTitle,
    setPresetColor,
    addText,
    addLine,
    addShape,
    addImageFiles,
    handleReplaceImage,
    applyFontToActive,
    resetFontToSystem,
    applyFontResource,
    centerObjectH,
    centerObjectV,
  };
}

export type CanvasObjects = ReturnType<typeof useCanvasObjects>;
