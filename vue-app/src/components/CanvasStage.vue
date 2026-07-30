<script setup lang="ts">
// ===== 画布舞台: 同时容纳 B站与抖音两个画布, 通过 v-show 切换 =====
// 警戒线为 DOM 元素叠加在 fabric canvas 之上 (不参与 fabric 渲染, 导出时无需隐藏)
// 支持拖拽图片到画布生成图片组件 (本地图读取, 不上传服务器;
//   上传服务器仅在资源管理器打开时由其 dropzone 接管)
import { useCanvasStore } from '@/stores/canvas';
import { ref } from 'vue';

const canvasStore = useCanvasStore();

// 拖拽高亮 (计数器避免子元素间切换误触发 dragleave)
const dragOver = ref(false);
let dragCounter = 0;

function isFileDrag(e: DragEvent): boolean {
  return !!(e.dataTransfer?.types?.includes('Files'));
}

function onDragEnter(e: DragEvent): void {
  if (!isFileDrag(e)) return;
  dragCounter++;
  dragOver.value = true;
}

function onDragOver(e: DragEvent): void {
  if (!isFileDrag(e)) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
}

function onDragLeave(e: DragEvent): void {
  if (!isFileDrag(e)) return;
  dragCounter = Math.max(0, dragCounter - 1);
  if (dragCounter === 0) dragOver.value = false;
}

function onCanvasDrop(e: DragEvent): void {
  dragOver.value = false;
  dragCounter = 0;
  if (!isFileDrag(e)) return;
  e.preventDefault();
  const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
  if (!files.length) return;
  // 画布坐标系落点 = (客户端坐标 - 容器左上角) / 缩放比
  const scale =
    canvasStore.activePlatform === 'bilibili'
      ? canvasStore.bilibiliScale
      : canvasStore.douyinScale;
  const wrap = e.currentTarget as HTMLElement;
  const rect = wrap.getBoundingClientRect();
  const pointer = {
    x: (e.clientX - rect.left) / scale,
    y: (e.clientY - rect.top) / scale,
  };
  canvasStore.addImageFiles(files, pointer);
}
</script>

<template>
  <div class="canvas-stage">
    <!-- B站 1920×1080 横屏画布 -->
    <div
      v-show="canvasStore.activePlatform === 'bilibili'"
      class="canvas-container-wrap"
      :class="{ 'is-drop-target': dragOver }"
      :style="{ transform: `scale(${canvasStore.bilibiliScale})` }"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onCanvasDrop"
    >
      <canvas id="bilibiliCanvas"></canvas>
      <!-- 警戒线 - B站 1440 中央安全区 -->
      <div class="safety-guide safety-bilibili"></div>
    </div>
    <!-- 抖音 1080×1920 竖屏画布 -->
    <div
      v-show="canvasStore.activePlatform === 'douyin'"
      class="canvas-container-wrap"
      :class="{ 'is-drop-target': dragOver }"
      :style="{ transform: `scale(${canvasStore.douyinScale})` }"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onCanvasDrop"
    >
      <canvas id="douyinCanvas"></canvas>
      <!-- 警戒线 - 抖音中央 1080×1320 安全区 (避开顶 220 / 底 380 UI overlay) -->
      <div class="safety-guide safety-douyin"></div>
    </div>
  </div>
</template>
