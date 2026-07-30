<script setup lang="ts">
// ===== 顶部栏: 平台切换 (B站/抖音) + 撤销重做 + 导出按钮 =====
import { useCanvasStore } from '@/stores/canvas'

const canvasStore = useCanvasStore()
</script>

<template>
  <div class="top-bar">
    <!-- 平台切换分段控制器 -->
    <div class="platform-segmented glass-panel">
      <button
        class="platform-seg-btn"
        :class="{ active: canvasStore.activePlatform === 'bilibili' }"
        title="B站横屏封面"
        @click="canvasStore.switchPlatform('bilibili')"
      >
        B站
      </button>
      <button
        class="platform-seg-btn"
        :class="{ active: canvasStore.activePlatform === 'douyin' }"
        title="抖音竖屏封面"
        @click="canvasStore.switchPlatform('douyin')"
      >
        抖音
      </button>
    </div>

    <div class="top-bar-right">
      <!-- 撤销 / 反撤销 -->
      <div class="history-toolbar glass-panel">
        <button
          class="tool-btn icon-only"
          :disabled="!canvasStore.canUndo"
          title="撤销 (Ctrl+Z)"
          @click="canvasStore.undo"
        >
          <iconify-icon icon="lucide:undo-2" width="16"></iconify-icon>
        </button>
        <button
          class="tool-btn icon-only"
          :disabled="!canvasStore.canRedo"
          title="反撤销 (Ctrl+Y)"
          @click="canvasStore.redo"
        >
          <iconify-icon icon="lucide:redo-2" width="16"></iconify-icon>
        </button>
      </div>
      <button class="btn-apple" title="导出当前平台封面" @click="canvasStore.exportCurrent">
        导出当前
      </button>
      <button
        class="btn-apple btn-primary"
        title="同时导出 B站和抖音两个封面"
        @click="canvasStore.exportBoth"
      >
        同时导出
      </button>
    </div>
  </div>
</template>
