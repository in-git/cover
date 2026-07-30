<script setup lang="ts">
// ===== 组件配置面板: 选中元素的编组/图层/填充/文字/字体/角度/透明度/替换图片/删除 =====
import { useCanvasStore } from '@/stores/canvas';
import { useResourceStore } from '@/stores/resource';
import { useUiStore } from '@/stores/ui';
import { fontPreviewFamily } from '@/utils/font';
import {
  Delete,
  Group,
  HorizontallyCentered,
  Magic,
  ToBottom,
  ToTop,
  Ungroup,
  VerticallyCentered,
} from '@icon-park/vue-next';
import { computed, ref } from 'vue';

const canvasStore = useCanvasStore();
const uiStore = useUiStore();
const resourceStore = useResourceStore();

// 替换图片上传 input (隐藏)
const replaceImgInput = ref<HTMLInputElement | null>(null);

function triggerReplaceImage(): void {
  replaceImgInput.value?.click();
}

// ===== 字体网格 (2x2, 参照资源管理器展示) =====
// 对接后端 /api/resources?category=fonts, 选项 = 系统默认 + 已上传字体列表
interface FontOption {
  value: string;
  label: string;
  fontFamily: string;
}

const fontOptions = computed<FontOption[]>(() => {
  const opts: FontOption[] = [
    { value: '-apple-system', label: '系统默认', fontFamily: '-apple-system' },
  ];
  resourceStore.resourceList.fonts.forEach((f) => {
    const family = fontPreviewFamily(f.name);
    opts.push({ value: family, label: f.name, fontFamily: family });
  });
  return opts;
});

/** 切换字体: 系统默认走 resetFontToSystem, 上传字体走 applyFontToActive */
function onFontChange(value: string): void {
  if (value === '-apple-system') {
    canvasStore.resetFontToSystem();
    return;
  }
  const font = resourceStore.resourceList.fonts.find(
    (f) => fontPreviewFamily(f.name) === value,
  );
  if (font) canvasStore.applyFontToActive(font);
}
</script>

<template>
  <div class="tab-panel">
    <!-- 选中元素的参数配置 -->
    <div v-if="canvasStore.activeObject">
      <!-- 操作网格: 居中/编组/图层/删除 (图标在上, 文字在下, IconPark 图标库) -->
      <div class="prop-group">
        <div class="action-grid">
          <a-tooltip title="水平居中" placement="top">
            <span class="tip-wrap">
              <button class="action-cell" @click="canvasStore.centerObjectH">
                <HorizontallyCentered :size="20" />
                <span>水平居中</span>
              </button>
            </span>
          </a-tooltip>
          <a-tooltip title="垂直居中" placement="top">
            <span class="tip-wrap">
              <button class="action-cell" @click="canvasStore.centerObjectV">
                <VerticallyCentered :size="20" />
                <span>垂直居中</span>
              </button>
            </span>
          </a-tooltip>
          <a-tooltip title="编组" placement="top">
            <span class="tip-wrap">
              <button
                class="action-cell"
                :disabled="!canvasStore.canGroup"
                @click="canvasStore.groupObjects"
              >
                <Group :size="20" />
                <span>编组</span>
              </button>
            </span>
          </a-tooltip>
          <a-tooltip title="取消编组" placement="top">
            <span class="tip-wrap">
              <button
                class="action-cell"
                :disabled="!canvasStore.canUngroup"
                @click="canvasStore.ungroupObjects"
              >
                <Ungroup :size="20" />
                <span>取消编组</span>
              </button>
            </span>
          </a-tooltip>
          <a-tooltip title="移至顶层" placement="top">
            <span class="tip-wrap">
              <button class="action-cell" @click="canvasStore.bringToFront">
                <ToTop :size="20" />
                <span>移至顶层</span>
              </button>
            </span>
          </a-tooltip>
          <a-tooltip title="移至底层" placement="top">
            <span class="tip-wrap">
              <button class="action-cell" @click="canvasStore.sendToBack">
                <ToBottom :size="20" />
                <span>移至底层</span>
              </button>
            </span>
          </a-tooltip>
          <a-tooltip title="删除选中元素 (Delete)" placement="top">
            <span class="tip-wrap">
              <button
                class="action-cell danger"
                @click="canvasStore.deleteObject"
              >
                <Delete :size="20" />
                <span>删除</span>
              </button>
            </span>
          </a-tooltip>
        </div>
      </div>

      <!-- 填充颜色 (文字/图形) -->
      <div v-if="canvasStore.hasColor" class="prop-group">
        <div class="prop-row">
          <span class="prop-label">填充颜色</span>
        </div>
        <div class="color-picker-wrap justify-between">
          <div class="flex items-center gap-2">
            <input
              type="color"
              v-model="canvasStore.activeProps.fill"
              @input="canvasStore.updateActiveProp('fill')"
            />
            <span class="color-hex">{{
              canvasStore.activeProps.fill.toUpperCase()
            }}</span>
          </div>
          <input
            type="text"
            v-model="canvasStore.activeProps.fill"
            class="w-[100px] border-none outline-none text-center py-1 rounded-md"
          />
        </div>

        <div
          class="preset-colors-wrap px-3 bg-gray-100 py-2 rounded-md"
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
        <button
          class="hot-title-open-btn"
          @click="uiStore.showHotTitles = true"
          style="margin-top: 10px"
        >
          <Magic :size="14" />
          <div class="text-nowrap">展开爆款标题库</div>
        </button>

        <!-- 字体选择 (2x2 网格, 参照资源管理器展示, 示例文本「字体」) -->
        <div class="prop-row" style="margin-top: 10px">
          <span class="prop-label">字体</span>
        </div>
        <div class="cp-font-grid">
          <button
            v-for="opt in fontOptions"
            :key="opt.value"
            type="button"
            class="cp-font-card"
            :class="{
              active: canvasStore.activeProps.fontFamily === opt.value,
            }"
            :title="opt.label"
            @click="onFontChange(opt.value)"
          >
            <span
              class="cp-font-sample"
              :style="{
                fontFamily: `${opt.fontFamily}, -apple-system, sans-serif`,
              }"
              >字体</span
            >
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
          max="350"
          step="1"
          @input="canvasStore.updateActiveProp('fontSize')"
        />
      </div>

      <!-- 旋转角度 (对所有组件生效) -->
      <div class="prop-group">
        <div class="prop-row">
          <span class="prop-label">旋转角度</span>
          <div class="angle-input-wrap">
            <input
              type="number"
              class="angle-input"
              v-model.number="canvasStore.activeProps.angle"
              min="-360"
              max="360"
              step="1"
              @input="canvasStore.updateActiveProp('angle')"
            />
            <span class="angle-unit">°</span>
          </div>
        </div>
        <input
          type="range"
          v-model="canvasStore.activeProps.angle"
          min="-180"
          max="180"
          step="1"
          @input="canvasStore.updateActiveProp('angle')"
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
      点击画布中的元素即可进行精准编辑<br />支持 Delete 删除，Ctrl+C/V
      复制粘贴<br /><br />💡 将图片直接拖到画布即可生成图片组件
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
