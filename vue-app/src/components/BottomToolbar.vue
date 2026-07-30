<script setup lang="ts">
// ===== 底部悬浮工具栏: 添加文字/分割线/色块/矩形/图片/图标 =====
import { useCanvasStore } from '@/stores/canvas';
import { ref } from 'vue';

const canvasStore = useCanvasStore();

// 本地图片上传 input (隐藏, 通过 ref.click() 触发)
const imageInput = ref<HTMLInputElement | null>(null);

function triggerImageUpload(): void {
  imageInput.value?.click();
}
</script>

<template>
  <div class="bottom-toolbar glass-panel">
    <button
      class="tool-btn icon-only"
      title="添加文字"
      @click="canvasStore.addText"
    >
      <iconify-icon icon="lucide:type" width="18"></iconify-icon>
    </button>
    <button
      class="tool-btn icon-only"
      title="分割线"
      @click="canvasStore.addLine"
    >
      <iconify-icon icon="lucide:minus" width="18"></iconify-icon>
    </button>
    <button
      class="tool-btn icon-only"
      title="色块图形"
      @click="canvasStore.addShape"
    >
      <iconify-icon icon="lucide:square" width="18"></iconify-icon>
    </button>
    <!-- 可自由拉伸的矩形色块 -->
    <button
      class="tool-btn icon-only"
      title="添加矩形 (可自由拉伸)"
      @click="canvasStore.addGlassCard"
    >
      <iconify-icon icon="lucide:square-stack" width="18"></iconify-icon>
    </button>
    <button
      class="tool-btn icon-only"
      title="上传图片"
      @click="triggerImageUpload"
    >
      <iconify-icon icon="lucide:image" width="18"></iconify-icon>
    </button>
    <button
      class="tool-btn icon-only"
      title="添加图标"
      @click="canvasStore.addIcon"
    >
      <iconify-icon icon="lucide:star" width="18"></iconify-icon>
    </button>

    <!-- 隐藏的图片上传 input -->
    <input
      ref="imageInput"
      type="file"
      class="file-input"
      accept="image/*"
      @change="canvasStore.handleImageUpload"
    />
  </div>
</template>
