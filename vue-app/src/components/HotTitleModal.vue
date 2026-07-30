<script setup lang="ts">
// ===== 爆款标题推荐模态框 =====
// 按话题分组展示爆款标题, 点击应用到当前选中文字后关闭
// 由 ComponentPanel 的「展开」按钮触发 (uiStore.showHotTitles)
import { useCanvasStore } from '@/stores/canvas';
import { useUiStore } from '@/stores/ui';
import { HOT_TITLE_GROUPS } from '@/utils/constants';
import { Close, Fire, Globe, PageTemplate } from '@icon-park/vue-next';
import type { Component } from 'vue';

const canvasStore = useCanvasStore();
const uiStore = useUiStore();

const groups = HOT_TITLE_GROUPS;

// 分组图标 key -> IconPark 组件映射 (保留按需引入, 避免 es/all 全量打包)
const iconMap: Record<string, Component> = {
  globe: Globe,
  'page-template': PageTemplate,
  fire: Fire,
};

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
          <Fire :size="18" />
          <span>爆款标题推荐</span>
        </div>
        <button
          class="ht-close"
          title="关闭 (Esc)"
          @click="uiStore.showHotTitles = false"
        >
          <Close :size="18" />
        </button>
      </header>

      <!-- 提示 -->
      <p class="ht-hint">点击标题即可应用到当前选中文字</p>

      <!-- 分组列表 (滚动) -->
      <div class="ht-body">
        <section v-for="g in groups" :key="g.category" class="ht-group">
          <div class="ht-group-title">
            <component :is="iconMap[g.icon]" :size="14" />
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
