<script setup lang="ts">
// ===== 资源管理器大屏模态框: 图片/字体 上传/删除/应用 =====
import { useResourceUpload } from '@/composables/useResourceUpload';
import { useCanvasStore } from '@/stores/canvas';
import { useResourceStore } from '@/stores/resource';
import type { ResourceCategory, ResourceItem } from '@/types';
import { fontPreviewFamily } from '@/utils/font';
import { ref } from 'vue';

const resourceStore = useResourceStore();
const canvasStore = useCanvasStore();
const { handleResourceDrop, handleResourceFilePick } = useResourceUpload();

// 资源选择 input (隐藏, 支持多文件)
const resourceInput = ref<HTMLInputElement | null>(null);

function triggerResourcePick(): void {
  if (resourceStore.rmUploading) return;
  resourceInput.value?.click();
}

/** 应用图片为画布背景后关闭弹窗 */
function applyImageResource(url: string): void {
  canvasStore.applyImageResource(url);
  resourceStore.closeResourceManager();
}

/** 应用字体到当前选中文字 (store 内部处理, 完成后关闭弹窗) */
function applyFontResource(font: ResourceItem): void {
  canvasStore.applyFontResource(font, () =>
    resourceStore.closeResourceManager(),
  );
}
</script>

<template>
  <div
    v-if="resourceStore.resourceModalOpen"
    class="rm-overlay"
    @click.self="resourceStore.closeResourceManager"
  >
    <div class="rm-modal">
      <!-- 顶部标题栏 -->
      <header class="rm-header">
        <div class="rm-title">
          <iconify-icon icon="lucide:folder" width="18"></iconify-icon>
          <span>资源管理器</span>
        </div>
        <button
          class="rm-close"
          title="关闭 (Esc)"
          @click="resourceStore.closeResourceManager"
        >
          <iconify-icon icon="lucide:x" width="18"></iconify-icon>
        </button>
      </header>

      <!-- 分类选项卡: 图片 / 字体 -->
      <div class="rm-tabs">
        <button
          class="rm-tab"
          :class="{ active: resourceStore.rmActiveTab === 'images' }"
          @click="resourceStore.rmActiveTab = 'images' as ResourceCategory"
        >
          <iconify-icon icon="lucide:image" width="14"></iconify-icon>
          图片
          <span class="rm-tab-count">{{
            resourceStore.resourceList.images.length
          }}</span>
        </button>
        <button
          class="rm-tab"
          :class="{ active: resourceStore.rmActiveTab === 'fonts' }"
          @click="resourceStore.rmActiveTab = 'fonts' as ResourceCategory"
        >
          <iconify-icon icon="lucide:type" width="14"></iconify-icon>
          字体
          <span class="rm-tab-count">{{
            resourceStore.resourceList.fonts.length
          }}</span>
        </button>
      </div>

      <!-- 拖拽上传区 -->
      <div
        class="rm-dropzone"
        :class="{ 'is-dragging': resourceStore.rmDragging }"
        @click="triggerResourcePick"
        @dragover.prevent="resourceStore.rmDragging = true"
        @dragleave.prevent="resourceStore.rmDragging = false"
        @drop.prevent.stop="handleResourceDrop"
      >
        <iconify-icon icon="lucide:upload-cloud" width="34"></iconify-icon>
        <div class="rm-drop-text">
          <strong>拖拽文件或文件夹到此处</strong>
          <span>或将文件拖到页面任意位置 · 支持批量上传 · 自动按类型归类</span>
        </div>
        <div class="rm-drop-hint">
          图片: JPG / PNG / GIF / WEBP / BMP / SVG　|　字体: TTF / OTF / WOFF /
          WOFF2
        </div>
      </div>

      <!-- 上传进度条 -->
      <div v-if="resourceStore.rmUploading" class="rm-progress">
        <div
          class="rm-progress-bar"
          :style="{ width: resourceStore.rmProgressPct + '%' }"
        ></div>
        <span class="rm-progress-text">{{ resourceStore.rmUploadStatus }}</span>
      </div>

      <!-- 资源网格 -->
      <div class="rm-grid-wrap">
        <div
          v-if="
            resourceStore.resourceList[resourceStore.rmActiveTab].length === 0
          "
          class="rm-empty"
        >
          <iconify-icon icon="lucide:package-open" width="40"></iconify-icon>
          <p>
            暂无{{
              resourceStore.rmActiveTab === 'images' ? '图片' : '字体'
            }}资源
          </p>
          <span>将文件拖到上方区域即可上传</span>
        </div>

        <!-- 图片网格 -->
        <div
          v-else-if="resourceStore.rmActiveTab === 'images'"
          class="rm-image-grid"
        >
          <div
            v-for="img in resourceStore.resourceList.images"
            :key="img.url"
            class="rm-image-card"
          >
            <div
              class="rm-image-thumb"
              :style="{ backgroundImage: `url(${img.url})` }"
              title="点击应用为背景"
              @click="applyImageResource(img.url)"
            >
              <span class="rm-apply-badge">应用为背景</span>
            </div>
            <div class="rm-image-meta">
              <span class="rm-file-name" :title="img.name">{{ img.name }}</span>
              <button
                class="rm-delete-btn"
                title="删除"
                @click="resourceStore.deleteResource(img)"
              >
                <iconify-icon icon="lucide:trash-2" width="13"></iconify-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- 字体列表 -->
        <div v-else class="rm-font-grid">
          <div
            v-for="font in resourceStore.resourceList.fonts"
            :key="font.url"
            class="rm-font-card"
            :style="{ '--font-preview': fontPreviewFamily(font.name) }"
          >
            <div
              class="rm-font-preview"
              title="点击应用到选中文字"
              @click="applyFontResource(font)"
            >
              <span class="rm-font-sample">永不失联的爱 1234</span>
            </div>
            <div class="rm-font-meta">
              <span class="rm-file-name" :title="font.name">{{
                font.name
              }}</span>
              <button
                class="rm-delete-btn"
                title="删除"
                @click="resourceStore.deleteResource(font)"
              >
                <iconify-icon icon="lucide:trash-2" width="13"></iconify-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐藏的多文件选择 input -->
      <input
        ref="resourceInput"
        type="file"
        class="file-input"
        multiple
        @change="handleResourceFilePick"
      />
    </div>
  </div>
</template>
