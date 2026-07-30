<script setup lang="ts">
// ===== 爆款标题推荐模态框 =====
// 按话题分组展示爆款标题, 点击应用到当前选中文字后关闭
// 由 ComponentPanel 的「展开」按钮触发 (uiStore.showHotTitles)
import { useCanvasStore } from '@/stores/canvas';
import { useUiStore } from '@/stores/ui';
import { HOT_TITLE_GROUPS } from '@/utils/constants';

const canvasStore = useCanvasStore();
const uiStore = useUiStore();

const groups = HOT_TITLE_GROUPS;

/** 应用标题到当前选中文字并关闭模态框 */
function applyAndClose(text: string): void {
  canvasStore.applyHotTitle(text);
  uiStore.showHotTitles = false;
}
</script>

<template>
  <div
    v-if="uiStore.showHotTitles"
    class="ht-overlay"
    @click.self="uiStore.showHotTitles = false"
  >
    <div class="ht-modal">
      <!-- 顶部标题栏 -->
      <header class="ht-header">
        <div class="ht-title">
          <iconify-icon icon="lucide:flame" width="18"></iconify-icon>
          <span>爆款标题推荐</span>
        </div>
        <button
          class="ht-close"
          title="关闭 (Esc)"
          @click="uiStore.showHotTitles = false"
        >
          <iconify-icon icon="lucide:x" width="18"></iconify-icon>
        </button>
      </header>

      <!-- 提示 -->
      <p class="ht-hint">点击标题即可应用到当前选中文字</p>

      <!-- 分组列表 (滚动) -->
      <div class="ht-body">
        <section
          v-for="g in groups"
          :key="g.category"
          class="ht-group"
        >
          <div class="ht-group-title">
            <iconify-icon :icon="g.icon" width="14"></iconify-icon>
            <span>{{ g.category }}</span>
            <span class="ht-group-count">{{ g.titles.length }}</span>
          </div>
          <div class="ht-chips">
            <button
              v-for="t in g.titles"
              :key="t"
              class="ht-chip"
              @click="applyAndClose(t)"
            >
              {{ t }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
