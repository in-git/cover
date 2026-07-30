<script setup lang="ts">
// ===== 背景配置面板: 画布背景色 + 背景图适配 + 透明度 =====
import { ref } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import type { BgFitMode } from '@/types'

const canvasStore = useCanvasStore()

// 自定义背景图上传 input (隐藏)
const bgInput = ref<HTMLInputElement | null>(null)

function triggerBgUpload(): void {
  bgInput.value?.click()
}
</script>

<template>
  <div class="tab-panel">
    <!-- 全局画布背景控制 -->
    <div class="prop-group">
      <div class="prop-row">
        <span class="prop-label">画布背景色</span>
      </div>
      <div class="color-picker-wrap">
        <input type="color" v-model="canvasStore.canvasBg" @input="canvasStore.updateCanvasBg" />
        <span class="color-hex">{{ canvasStore.canvasBg.toUpperCase() }}</span>
      </div>
      <div class="btn-row">
        <button class="btn-secondary" @click="triggerBgUpload">自定义背景图</button>
      </div>
    </div>

    <!-- 背景图透明度控制 (两个画布共享) -->
    <div v-if="canvasStore.sharedBgImageUrl" class="prop-group">
      <!-- 背景图适配方式 -->
      <div class="prop-row">
        <span class="prop-label">背景图适配</span>
      </div>
      <div class="bg-fit-modes">
        <button
          class="bg-fit-btn"
          :class="{ active: canvasStore.bgFitMode === 'stretch' }"
          title="拉伸填满 (可能变形)"
          @click="canvasStore.setBgFitMode('stretch' as BgFitMode)"
        >
          拉伸
        </button>
        <button
          class="bg-fit-btn"
          :class="{ active: canvasStore.bgFitMode === 'contain' }"
          title="原比例完整显示 (留白)"
          @click="canvasStore.setBgFitMode('contain' as BgFitMode)"
        >
          原比例
        </button>
        <button
          class="bg-fit-btn"
          :class="{ active: canvasStore.bgFitMode === 'cover' }"
          title="原比例覆盖填满 (裁剪)"
          @click="canvasStore.setBgFitMode('cover' as BgFitMode)"
        >
          覆盖
        </button>
      </div>

      <div class="prop-row" style="margin-top: 12px">
        <span class="prop-label">背景图透明度</span>
        <span class="color-hex">{{ Math.round(canvasStore.bgOpacity * 100) }}%</span>
      </div>
      <input
        type="range"
        v-model="canvasStore.bgOpacity"
        min="0.05"
        max="1"
        step="0.05"
        @input="canvasStore.updateBgOpacity"
      />
    </div>

    <!-- 隐藏的背景图上传 input -->
    <input
      ref="bgInput"
      type="file"
      class="file-input"
      accept="image/*"
      @change="canvasStore.handleBgUpload"
    />
  </div>
</template>
