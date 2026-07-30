<script setup lang="ts">
// ===== 组件配置面板: 选中元素的编组/图层/填充/文字/字体/透明度/替换图片/删除 =====
import { useCanvasStore } from '@/stores/canvas';
import { useResourceStore } from '@/stores/resource';
import { useUiStore } from '@/stores/ui';
import type { ResourceItem } from '@/types';
import { HOT_TITLES } from '@/utils/constants';
import { fontPreviewFamily } from '@/utils/font';
import { computed, ref } from 'vue';

const canvasStore = useCanvasStore();
const uiStore = useUiStore();
const resourceStore = useResourceStore();

const hotTitles = HOT_TITLES;

// 替换图片上传 input (隐藏)
const replaceImgInput = ref<HTMLInputElement | null>(null);

function triggerReplaceImage(): void {
  replaceImgInput.value?.click();
}

function applyHotTitleAndClose(text: string): void {
  canvasStore.applyHotTitle(text);
  uiStore.showHotTitles = false;
}

// ===== 字体选择器 =====
// 当前字体显示名 (根据 fontFamily 反查, 找不到则回退"系统默认")
const currentFontLabel = computed(() => {
  const family = canvasStore.activeProps.fontFamily;
  if (!family || family === '-apple-system') return '系统默认';
  const font = resourceStore.resourceList.fonts.find(
    (f) => fontPreviewFamily(f.name) === family,
  );
  return font ? font.name : '系统默认';
});

function isCurrentFont(font: ResourceItem): boolean {
  return fontPreviewFamily(font.name) === canvasStore.activeProps.fontFamily;
}

/** 应用字体到当前选中文字 (保持 popover 打开, 方便快速预览切换) */
function applyFont(font: ResourceItem): void {
  canvasStore.applyFontToActive(font);
}
</script>

<template>
  <div class="tab-panel">
    <!-- 选中元素的参数配置 -->
    <div v-if="canvasStore.activeObject">
      <!-- 编组与图层 (纯图标一排) -->
      <div class="prop-group">
        <div class="btn-row icon-only-row">
          <button
            class="btn-secondary icon-only-btn"
            :disabled="!canvasStore.canGroup"
            title="编组"
            @click="canvasStore.groupObjects"
          >
            <iconify-icon icon="lucide:group" width="15"></iconify-icon>
          </button>
          <button
            class="btn-secondary icon-only-btn"
            :disabled="!canvasStore.canUngroup"
            title="取消编组"
            @click="canvasStore.ungroupObjects"
          >
            <iconify-icon icon="lucide:ungroup" width="15"></iconify-icon>
          </button>
          <button
            class="btn-secondary icon-only-btn"
            title="移至顶层"
            @click="canvasStore.bringToFront"
          >
            <iconify-icon
              icon="lucide:bring-to-front"
              width="15"
            ></iconify-icon>
          </button>
          <button
            class="btn-secondary icon-only-btn"
            title="移至底层"
            @click="canvasStore.sendToBack"
          >
            <iconify-icon icon="lucide:send-to-back" width="15"></iconify-icon>
          </button>
        </div>
      </div>

      <!-- 填充颜色 (文字/图形) -->
      <div v-if="canvasStore.hasColor" class="prop-group">
        <div class="prop-row">
          <span class="prop-label">填充颜色</span>
        </div>
        <div class="color-picker-wrap">
          <input
            type="color"
            v-model="canvasStore.activeProps.fill"
            @input="canvasStore.updateActiveProp('fill')"
          />
          <span class="color-hex">{{
            canvasStore.activeProps.fill.toUpperCase()
          }}</span>
        </div>

        <div
          v-if="canvasStore.isText"
          class="preset-colors-wrap"
          style="margin-top: 8px"
        >
          <div
            v-for="color in canvasStore.fillPresetColors"
            :key="color"
            class="preset-btn"
            :style="{ background: color }"
            :title="color"
            @click="canvasStore.setPresetColor(color)"
          ></div>
        </div>
      </div>

      <!-- 毛玻璃组件专属配置 (边框、背景及颜色) -->
      <div v-if="canvasStore.isGlassCard" class="prop-group">
        <div class="prop-row"><span class="prop-label">毛玻璃背景色</span></div>
        <div class="color-picker-wrap">
          <input
            type="color"
            v-model="canvasStore.glassProps.fill"
            @input="canvasStore.updateGlassProp"
          />
          <span class="color-hex">{{
            canvasStore.glassProps.fill.toUpperCase()
          }}</span>
        </div>
        <div class="prop-row" style="margin-top: 10px">
          <span class="prop-label">毛玻璃边框颜色</span>
        </div>
        <div class="color-picker-wrap">
          <input
            type="color"
            v-model="canvasStore.glassProps.stroke"
            @input="canvasStore.updateGlassProp"
          />
          <span class="color-hex">{{
            canvasStore.glassProps.stroke.toUpperCase()
          }}</span>
        </div>
      </div>

      <!-- 文字配置与爆款标题选择 -->
      <div v-if="canvasStore.isText" class="prop-group">
        <div class="prop-row">
          <span class="prop-label">标题内容设置</span>
        </div>
        <input
          type="text"
          class="text-input-field"
          v-model="canvasStore.activeProps.textValue"
          placeholder="输入封面标题..."
          @input="canvasStore.updateTextContent"
        />

        <!-- 字体选择 (popover 弹出, 对接后端 /api/resources?category=fonts) -->
        <div class="prop-row" style="margin-top: 10px">
          <span class="prop-label">字体</span>
          <button class="hot-title-trigger" @click="uiStore.toggleFontPicker()">
            <span class="font-trigger-name">{{ currentFontLabel }}</span>
            <iconify-icon
              :icon="
                uiStore.showFontPicker
                  ? 'lucide:chevron-up'
                  : 'lucide:chevron-down'
              "
              width="12"
            ></iconify-icon>
          </button>
        </div>
        <div v-if="uiStore.showFontPicker" class="font-picker-popover">
          <div
            v-if="resourceStore.resourceList.fonts.length === 0"
            class="font-picker-empty"
          >
            <iconify-icon icon="lucide:package-open" width="22"></iconify-icon>
            <span>暂无字体, 点击左上角资源管理器上传</span>
          </div>
          <div v-else class="font-picker-list">
            <div
              v-for="font in resourceStore.resourceList.fonts"
              :key="font.url"
              class="font-card"
              :class="{ active: isCurrentFont(font) }"
              :style="{ '--font-preview': fontPreviewFamily(font.name) }"
              :title="font.name"
              @click="applyFont(font)"
            >
              <span class="font-card-sample">永不失联的爱 1234</span>
              <span class="font-card-name">{{ font.name }}</span>
            </div>
          </div>
        </div>

        <!-- 爆款标题列表 (popover 弹出) -->
        <div class="prop-row" style="margin-top: 10px">
          <span class="prop-label">🔥 爆款标题推荐</span>
          <button class="hot-title-trigger" @click="uiStore.toggleHotTitles()">
            {{ uiStore.showHotTitles ? '收起' : '展开' }}
            <iconify-icon
              :icon="
                uiStore.showHotTitles
                  ? 'lucide:chevron-up'
                  : 'lucide:chevron-down'
              "
              width="12"
            ></iconify-icon>
          </button>
        </div>
        <div v-if="uiStore.showHotTitles" class="hot-title-popover">
          <button
            v-for="t in hotTitles"
            :key="t"
            class="hot-title-tag"
            @click="applyHotTitleAndClose(t)"
          >
            {{ t }}
          </button>
        </div>

        <div class="prop-row" style="margin-top: 10px">
          <span class="prop-label">字号</span>
          <span class="color-hex"
            >{{ canvasStore.activeProps.fontSize }}px</span
          >
        </div>
        <input
          type="range"
          v-model="canvasStore.activeProps.fontSize"
          min="20"
          max="240"
          step="1"
          @input="canvasStore.updateActiveProp('fontSize')"
        />
      </div>

      <!-- 不透明度 -->
      <div class="prop-group">
        <div class="prop-row">
          <span class="prop-label">不透明度</span>
          <span class="color-hex">
            {{ Math.round(canvasStore.activeProps.opacity * 100) }}%
          </span>
        </div>
        <input
          type="range"
          v-model="canvasStore.activeProps.opacity"
          min="0.05"
          max="1"
          step="0.05"
          @input="canvasStore.updateActiveProp('opacity')"
        />
      </div>

      <!-- 图片替换 -->
      <div v-if="canvasStore.isImage" class="prop-group">
        <div class="btn-row">
          <button class="btn-secondary" @click="triggerReplaceImage">
            替换图片
          </button>
        </div>
      </div>

      <button class="btn-danger-light" @click="canvasStore.deleteObject">
        删除选中元素 (Delete)
      </button>
    </div>

    <div
      v-else
      style="
        font-size: 12px;
        color: var(--text-tertiary);
        text-align: center;
        margin-top: 30px;
      "
    >
      点击画布中的元素即可进行精准编辑<br />支持 Delete 删除，Ctrl+C/V 复制粘贴
    </div>

    <!-- 隐藏的替换图片 input -->
    <input
      ref="replaceImgInput"
      type="file"
      class="file-input"
      accept="image/*"
      @change="canvasStore.handleReplaceImage"
    />
  </div>
</template>
