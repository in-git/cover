// ===== 全局拖拽上传 composable =====
// 监听 window 拖拽事件, 将文件/文件夹拖到页面任意位置均可上传
// - 模态框关闭时: 显示全屏提示层, 拖到任意位置触发上传
// - 模态框打开时: 不显示提示层 (模态框 dropzone 自身处理, 已 .stop 阻止冒泡),
//   但拖到模态框外的遮罩处仍可由本监听接收上传
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useResourceStore } from '@/stores/resource';
import { traverseEntries } from '@/composables/useResourceUpload';

/** 判断拖拽事件是否携带文件 (排除文字/链接拖拽) */
function isFileDrag(e: DragEvent): boolean {
  return !!(
    e.dataTransfer &&
    e.dataTransfer.types &&
    e.dataTransfer.types.includes('Files')
  );
}

/** 从 DragEvent 收集文件 (支持文件夹递归, 复用 traverseEntries) */
async function collectFiles(e: DragEvent): Promise<File[]> {
  const items = e.dataTransfer ? e.dataTransfer.items : null;
  const files: File[] = [];

  if (items && items.length && (items[0] as any).webkitGetAsEntry) {
    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = (items[i] as any).webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
    await traverseEntries(entries, files);
  } else {
    const droppedFiles = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
    files.push(...droppedFiles);
  }
  return files;
}

export function useGlobalDropUpload() {
  const resourceStore = useResourceStore();

  // 是否正在拖拽文件进入页面 (计数器避免子元素间切换误触发 dragleave)
  const globalDragging = ref(false);
  let dragCounter = 0;

  // 全屏提示层仅在「拖拽中 + 模态框关闭」时显示
  // 模态框打开时由其内置 dropzone 接管视觉反馈
  const showGlobalDrop = computed(
    () => globalDragging.value && !resourceStore.resourceModalOpen,
  );

  function onDragEnter(e: DragEvent): void {
    if (!isFileDrag(e) || resourceStore.rmUploading) return;
    dragCounter++;
    globalDragging.value = true;
  }

  function onDragOver(e: DragEvent): void {
    if (!isFileDrag(e)) return;
    // 必须 preventDefault 才能在 drop 事件中接收文件
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  function onDragLeave(e: DragEvent): void {
    if (!isFileDrag(e)) return;
    dragCounter = Math.max(0, dragCounter - 1);
    if (dragCounter === 0) {
      globalDragging.value = false;
    }
  }

  async function onDrop(e: DragEvent): Promise<void> {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragCounter = 0;
    globalDragging.value = false;
    if (resourceStore.rmUploading) return;
    // 若拖到模态框内置 dropzone, 其 @drop.stop 会阻止冒泡, 不会进入这里
    const files = await collectFiles(e);
    if (files.length) {
      await resourceStore.uploadFiles(files);
    }
  }

  onMounted(() => {
    // window 级别监听, 覆盖整个页面; onDragOver/onDrop 内已 preventDefault,
    // 可阻止浏览器默认的「拖文件到页面会打开文件」行为
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
  });

  onUnmounted(() => {
    window.removeEventListener('dragenter', onDragEnter);
    window.removeEventListener('dragover', onDragOver);
    window.removeEventListener('dragleave', onDragLeave);
    window.removeEventListener('drop', onDrop);
  });

  return { showGlobalDrop };
}
