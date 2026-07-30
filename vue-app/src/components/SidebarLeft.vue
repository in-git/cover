<script setup lang="ts">
// ===== 左侧栏: 模板中心 + 背景图快选 (含 simplex 噪声随机生成) =====
import { useCanvasStore } from '@/stores/canvas';
import { useResourceStore } from '@/stores/resource';
import { useTemplateStore } from '@/stores/template';
import { Add, Close, Magic } from '@icon-park/vue-next';

const canvasStore = useCanvasStore();
const templateStore = useTemplateStore();
const resourceStore = useResourceStore();
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
        <Add :size="16" />
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
          <div
            class="tpl-color-preview"
            :style="{ background: tpl.bgPreview }"
          ></div>
          <span class="tpl-title">{{ tpl.name }}</span>
        </div>
        <div class="tpl-actions">
          <button
            class="action-btn delete"
            @click.stop="templateStore.deleteTemplate(index)"
            title="删除模板"
          >
            <Close :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 背景图: 随机生成 + 本地图片快选 -->
    <div class="sidebar-header">
      <span class="section-title">背景图</span>
      <button
        class="btn-icon-only"
        @click="canvasStore.applyNoiseBackground"
        title="使用 SimplexNoise 随机生成一张背景图"
      >
        <Magic :size="16" />
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
        点击右上「资源管理」上传图片
      </div>
    </div>
    <div v-else class="loading-bg">加载中...</div>
  </aside>
</template>
