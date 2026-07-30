<script setup lang="ts">
// ===== 底部悬浮工具栏: 添加文字 / 分割线 / 色块 =====
// 吸附开关已移至顶部居中工具栏 (与撤销/重做同组, 见 TopBar.vue)
// 图片组件改为拖拽图片到画布生成 (见 CanvasStage), 不再提供按钮上传
import { useCanvasStore } from '@/stores/canvas';

const canvasStore = useCanvasStore();
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
  </div>
</template>
