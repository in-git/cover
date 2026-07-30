<script setup lang="ts">
// ===== 中间主区域: 顶部工具栏 + 画布舞台 + 底部组件添加栏 =====
import BottomToolbar from '@/components/BottomToolbar.vue';
import CanvasStage from '@/components/CanvasStage.vue';
import TopBar from '@/components/TopBar.vue';
</script>

<template>
  <main class="main-area">
    <TopBar />
    <CanvasStage />
    <BottomToolbar />
  </main>
</template>
