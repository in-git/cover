<script setup lang="ts">
// ===== 根组件 =====
// 负责三栏布局挂载 + fabric 画布初始化 + 键盘/生命周期管理
// (与原版 onMounted / onUnmounted 逻辑对应)
import MainArea from '@/components/MainArea.vue';
import ResourceManager from '@/components/ResourceManager.vue';
import SidebarLeft from '@/components/SidebarLeft.vue';
import SidebarRight from '@/components/SidebarRight.vue';
import { useGlobalDropUpload } from '@/composables/useGlobalDropUpload';
import { useKeyboard } from '@/composables/useKeyboard';
import { useCanvasStore } from '@/stores/canvas';
import { useResourceStore } from '@/stores/resource';
import { useTemplateStore } from '@/stores/template';
import { CANVAS_DIMS } from '@/utils/constants';
import { fabric } from '@/utils/fabric';
import { onMounted, onUnmounted, ref } from 'vue';

const canvasStore = useCanvasStore();
const templateStore = useTemplateStore();
const resourceStore = useResourceStore();

// 键盘快捷键 (内部注册/卸载 window keydown 监听)
useKeyboard();

// 全局拖拽上传: 拖文件/文件夹到页面任意位置均可上传 (内部注册/卸载 window 拖拽监听)
const { showGlobalDrop } = useGlobalDropUpload();

// 主区域组件引用 (用于触发 resize)
const mainAreaRef = ref<InstanceType<typeof MainArea> | null>(null);

function handleResize(): void {
  const el = mainAreaRef.value?.$el as HTMLElement | undefined;
  canvasStore.handleResize(el || null);
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);

  // 拉取资源 (图片 + 字体)
  resourceStore.fetchResources();

  // fabric 全局选中样式 (Apple HIG 风格圆点手柄)
  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: '#ffffff',
    cornerStrokeColor: '#0071e3',
    borderColor: '#0071e3',
    cornerSize: 18,
    padding: 8,
    cornerStyle: 'circle',
    borderDashArray: [4, 4],
  });

  // 同时初始化两个画布 (B站横屏 + 抖音竖屏)
  canvasStore.initCanvasInstance('bilibili', CANVAS_DIMS.bilibili);
  canvasStore.initCanvasInstance('douyin', CANVAS_DIMS.douyin);

  // 加载首个模板 (若有)
  if (templateStore.templates.length > 0) {
    canvasStore.loadTemplate(templateStore.templates[0]);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  // 释放两个 fabric 实例
  canvasStore.dispose();
});
</script>

<template>
  <div id="app-root">
    <!-- 左侧: 模板中心 + 资源快选 -->
    <SidebarLeft />

    <!-- 中间: 画布工作区 (顶部导出 + 画布舞台 + 底部工具栏) -->
    <MainArea ref="mainAreaRef" />

    <!-- 右侧: 属性配置面板 -->
    <SidebarRight />

    <!-- 资源管理器大屏模态框 -->
    <ResourceManager />

    <!-- 全局拖拽上传提示层: 拖文件到页面任意位置均触发上传 -->
    <div v-if="showGlobalDrop" class="global-drop-overlay">
      <div class="global-drop-inner">
        <iconify-icon icon="lucide:upload-cloud" width="56"></iconify-icon>
        <div class="global-drop-title">松开鼠标即可上传</div>
        <div class="global-drop-sub">
          支持图片与字体 · 自动按类型归类 · 支持文件夹批量
        </div>
      </div>
    </div>
  </div>
</template>
