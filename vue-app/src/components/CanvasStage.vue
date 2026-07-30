<script setup lang="ts">
// ===== 画布舞台: 同时容纳 B站与抖音两个画布, 通过 v-show 切换 =====
// 警戒线为 DOM 元素叠加在 fabric canvas 之上 (不参与 fabric 渲染, 导出时无需隐藏)
import { useCanvasStore } from '@/stores/canvas';

const canvasStore = useCanvasStore();
</script>

<template>
  <div class="canvas-stage">
    <!-- B站 1920×1080 横屏画布 -->
    <div
      v-show="canvasStore.activePlatform === 'bilibili'"
      class="canvas-container-wrap"
      :style="{ transform: `scale(${canvasStore.bilibiliScale})` }"
    >
      <canvas id="bilibiliCanvas"></canvas>
      <!-- 警戒线 - B站 1440 中央安全区 -->
      <div class="safety-guide safety-bilibili"></div>
    </div>
    <!-- 抖音 1080×1920 竖屏画布 -->
    <div
      v-show="canvasStore.activePlatform === 'douyin'"
      class="canvas-container-wrap"
      :style="{ transform: `scale(${canvasStore.douyinScale})` }"
    >
      <canvas id="douyinCanvas"></canvas>
      <!-- 警戒线 - 抖音中央 1080×1320 安全区 (避开顶 220 / 底 380 UI overlay) -->
      <div class="safety-guide safety-douyin"></div>
    </div>
  </div>
</template>
