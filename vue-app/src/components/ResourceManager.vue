<script setup lang="ts">
// ===== 资源管理器大屏模态框: 图片/字体 上传/删除/应用 =====
import { useResourceUpload } from '@/composables/useResourceUpload';
import { useCanvasStore } from '@/stores/canvas';
import { useResourceStore } from '@/stores/resource';
import type { ResourceItem } from '@/types';
import { fontPreviewFamily } from '@/utils/font';
import { computed, ref } from 'vue';

const resourceStore = useResourceStore();
const canvasStore = useCanvasStore();
const { handleResourceDrop, handleResourceFilePick } = useResourceUpload();

// 资源选择 input (隐藏, 支持多文件)
const resourceInput = ref<HTMLInputElement | null>(null);
// 多选选中项 (按 url 去重)
const selected = ref<Set<string>>(new Set());

const selectedCount = computed(() => selected.value.size);

function triggerResourcePick(): void {
  if (resourceStore.rmUploading) return;
  resourceInput.value?.click();
}

/** 应用字体到当前选中文字 (store 内部处理, 完成后关闭弹窗) */
function applyFontResource(font: ResourceItem): void {
  canvasStore.applyFontResource(font, () =>
    resourceStore.closeResourceManager(),
  );
}

/** 格式化文件大小 (B / KB / MB) */
function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/** 切换某一项的选中状态 */
function toggleSelect(url: string): void {
  const next = new Set(selected.value);
  if (next.has(url)) next.delete(url);
  else next.add(url);
  selected.value = next;
}

function clearSelection(): void {
  selected.value = new Set();
}

/** 批量删除选中 (无确认弹窗) */
async function deleteSelected(): Promise<void> {
  if (selectedCount.value === 0 || resourceStore.rmDeleting) return;
  const list =
    resourceStore.rmActiveTab === 'images'
      ? resourceStore.resourceList.images
      : resourceStore.resourceList.fonts;
  const items = list.filter((it) => selected.value.has(it.url));
  await resourceStore.deleteResources(items);
  clearSelection();
}

/** 单个删除 (无确认弹窗) */
async function deleteOne(res: ResourceItem): Promise<void> {
  await resourceStore.deleteResource(res);
  const next = new Set(selected.value);
  next.delete(res.url);
  selected.value = next;
}

/** 整个模态框作为拖拽目标 */
function onModalDrop(e: DragEvent): void {
  handleResourceDrop(e);
}
</script>

<template>
  <div
    v-if="resourceStore.resourceModalOpen"
    class="rm-overlay"
    @click.self="resourceStore.closeResourceManager"
  >
    <div
      class="rm-modal"
      :class="{ 'is-dragging': resourceStore.rmDragging }"
      @dragover.prevent="resourceStore.rmDragging = true"
      @dragleave.prevent="resourceStore.rmDragging = false"
      @drop.prevent.stop="onModalDrop"
    >
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
          @click="
            resourceStore.rmActiveTab = 'images';
            clearSelection();
          "
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
          @click="
            resourceStore.rmActiveTab = 'fonts';
            clearSelection();
          "
        >
          <iconify-icon icon="lucide:type" width="14"></iconify-icon>
          字体
          <span class="rm-tab-count">{{
            resourceStore.resourceList.fonts.length
          }}</span>
        </button>
      </div>

      <!-- 工具栏: 上传 + 批量删除 + 提示 -->
      <div class="rm-toolbar">
        <button
          class="rm-tool-btn rm-upload-btn"
          :disabled="resourceStore.rmUploading"
          @click="triggerResourcePick"
        >
          <iconify-icon icon="lucide:upload" width="14"></iconify-icon>
          上传
        </button>
        <button
          class="rm-tool-btn rm-batch-del-btn"
          :disabled="selectedCount === 0 || resourceStore.rmDeleting"
          @click="deleteSelected"
        >
          <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
          删除选中<span v-if="selectedCount" class="rm-batch-count"
            >({{ selectedCount }})</span
          >
        </button>
        <span class="rm-toolbar-hint"
          >拖拽文件到窗口即可上传 · 自动按类型归类</span
        >
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
        <!-- 加载中 -->
        <div v-if="resourceStore.loadingBackgrounds" class="rm-loading">
          <iconify-icon
            icon="lucide:loader-2"
            width="28"
            class="rm-spin"
          ></iconify-icon>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="
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
          <span>点击上方"上传"或拖拽文件到窗口即可上传</span>
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
            :class="{ selected: selected.has(img.url) }"
          >
            <div
              class="rm-image-thumb"
              :style="{ backgroundImage: `url(${img.url})` }"
              title="点击选中"
              @click="toggleSelect(img.url)"
            >
              <button
                type="button"
                class="rm-select-check"
                :class="{ checked: selected.has(img.url) }"
                title="选中"
                @click.stop="toggleSelect(img.url)"
              >
                <iconify-icon
                  v-if="selected.has(img.url)"
                  icon="lucide:check"
                  width="13"
                ></iconify-icon>
              </button>
            </div>
            <div class="rm-image-meta">
              <span class="rm-file-name" :title="img.name">{{ img.name }}</span>
              <span class="rm-file-size">{{ formatSize(img.size) }}</span>
              <button
                class="rm-delete-btn"
                title="删除"
                @click="deleteOne(img)"
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
            :class="{ selected: selected.has(font.url) }"
            :style="{ '--font-preview': fontPreviewFamily(font.name) }"
          >
            <div
              class="rm-font-preview"
              title="点击应用到选中文字"
              @click="applyFontResource(font)"
            >
              <button
                type="button"
                class="rm-select-check"
                :class="{ checked: selected.has(font.url) }"
                title="选中"
                @click.stop="toggleSelect(font.url)"
              >
                <iconify-icon
                  v-if="selected.has(font.url)"
                  icon="lucide:check"
                  width="13"
                ></iconify-icon>
              </button>
              <span class="rm-font-sample">字体</span>
            </div>
            <div class="rm-font-meta">
              <span class="rm-file-name" :title="font.name">{{
                font.name
              }}</span>
              <span class="rm-file-size">{{ formatSize(font.size) }}</span>
              <button
                class="rm-delete-btn"
                title="删除"
                @click="deleteOne(font)"
              >
                <iconify-icon icon="lucide:trash-2" width="13"></iconify-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- 批量删除 loading 遮罩 -->
        <div v-if="resourceStore.rmDeleting" class="rm-loading-overlay">
          <iconify-icon
            icon="lucide:loader-2"
            width="30"
            class="rm-spin"
          ></iconify-icon>
          <span>正在删除...</span>
        </div>
      </div>

      <!-- 拖拽上传遮罩 -->
      <div v-if="resourceStore.rmDragging" class="rm-drop-overlay">
        <iconify-icon icon="lucide:upload-cloud" width="48"></iconify-icon>
        <span>松开以上传文件</span>
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
