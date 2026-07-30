<script setup lang="ts">
// ===== 左侧栏: 模板中心 + 资源管理器入口 + 本地图片快选 =====
import { useCanvasStore } from '@/stores/canvas'
import { useTemplateStore } from '@/stores/template'
import { useResourceStore } from '@/stores/resource'

const canvasStore = useCanvasStore()
const templateStore = useTemplateStore()
const resourceStore = useResourceStore()
</script>

<template>
  <aside class="sidebar glass-panel">
    <!-- 模板中心 -->
    <div class="sidebar-header">
      <span class="section-title">模板中心</span>
      <button
        class="btn-icon-only"
        @click="canvasStore.createEmptyTemplate"
        title="新增空白模板"
      >
        <iconify-icon icon="lucide:plus" width="16"></iconify-icon>
      </button>
    </div>

    <div class="template-list">
      <div
        v-for="(tpl, index) in templateStore.templates"
        :key="tpl.id"
        class="template-card"
        :class="{ active: templateStore.currentTemplateId === tpl.id }"
        @click="canvasStore.loadTemplate(tpl)"
      >
        <div class="tpl-info">
          <div class="tpl-color-preview" :style="{ background: tpl.bgPreview }"></div>
          <span class="tpl-title">{{ tpl.name }}</span>
        </div>
        <div class="tpl-actions">
          <button
            class="action-btn delete"
            @click.stop="templateStore.deleteTemplate(index)"
            title="删除模板"
          >
            <iconify-icon icon="lucide:x" width="14"></iconify-icon>
          </button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 资源管理器入口 -->
    <div class="sidebar-header">
      <span class="section-title">资源管理器</span>
      <button
        class="btn-icon-only"
        @click="resourceStore.openResourceManager"
        title="打开资源管理器"
      >
        <iconify-icon icon="lucide:folder-open" width="16"></iconify-icon>
      </button>
    </div>

    <!-- 本地图片资源快选 (从后端拉取, 点击直接应用为背景) -->
    <div v-if="!resourceStore.loadingBackgrounds" class="public-bg-grid flex-1">
      <div
        v-for="(bg, idx) in resourceStore.localImages"
        :key="bg.url + idx"
        class="public-bg-thumb"
        :style="{ backgroundImage: `url(${bg.url})` }"
        :title="bg.name"
        @click="canvasStore.applyPublicBackground(bg.url)"
      ></div>
      <div
        v-if="resourceStore.localImages.length === 0"
        class="empty-bg-hint"
        @click="resourceStore.openResourceManager"
      >
        点击打开资源管理器上传图片
      </div>
    </div>
    <div v-else class="loading-bg">加载中...</div>
  </aside>
</template>
