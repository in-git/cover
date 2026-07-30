<script setup lang="ts">
// ===== 顶部栏: 平台切换 (左) + 撤销重做与吸附开关 (中, 屏幕水平居中) + 导出按钮 (右) =====
import { useCanvasStore } from '@/stores/canvas';

const canvasStore = useCanvasStore();
</script>

<template>
  <div class="top-bar">
    <!-- 左: 平台切换分段控制器 -->
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

    <!-- 中: 撤销 / 反撤销 / 吸附开关 (绝对定位水平居中) -->
    <div class="top-bar-center">
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
        <span class="tool-divider"></span>
        <button
          class="tool-btn icon-only"
          :class="{ 'is-active': canvasStore.snapEnabled }"
          :title="
            canvasStore.snapEnabled
              ? '吸附已开启 (拖动时对齐边缘/中心)'
              : '吸附已关闭'
          "
          @click="canvasStore.snapEnabled = !canvasStore.snapEnabled"
        >
          <iconify-icon icon="lucide:magnet" width="18"></iconify-icon>
        </button>
      </div>
    </div>

    <!-- 右: 导出按钮 -->
    <div class="top-bar-right">
      <button
        class="btn-apple"
        title="导出当前平台封面"
        @click="canvasStore.exportCurrent"
      >
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
