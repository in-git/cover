<script setup lang="ts">
// ===== 右侧栏: 属性配置面板 (组件配置 / 背景配置 两个选项卡) =====
import { useUiStore } from '@/stores/ui'
import BackgroundPanel from '@/components/BackgroundPanel.vue'
import ComponentPanel from '@/components/ComponentPanel.vue'

const uiStore = useUiStore()
</script>

<template>
  <aside class="sidebar glass-panel">
    <div class="sidebar-header">
      <span class="section-title">属性配置</span>
    </div>

    <!-- 选项卡 (iOS 分段控制器) -->
    <div class="tab-segmented">
      <button
        class="tab-seg-btn"
        :class="{ active: uiStore.activeTab === 'component' }"
        @click="uiStore.setTab('component')"
      >
        组件配置
      </button>
      <button
        class="tab-seg-btn"
        :class="{ active: uiStore.activeTab === 'background' }"
        @click="uiStore.setTab('background')"
      >
        背景配置
      </button>
    </div>

    <BackgroundPanel v-show="uiStore.activeTab === 'background'" />
    <ComponentPanel v-show="uiStore.activeTab === 'component'" />
  </aside>
</template>
