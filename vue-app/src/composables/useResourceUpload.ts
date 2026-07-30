// ===== 资源拖拽上传 composable =====
// 支持文件夹递归读取 (FileSystemEntry), 与原版 traverseEntries / handleResourceDrop 逻辑一致
import { useResourceStore } from '@/stores/resource';

// 递归遍历 FileSystemEntry (fileSystemDirectoryEntry / fileSystemFileEntry)
// 导出供 useGlobalDropUpload 复用, 避免重复实现
export function traverseEntries(entries: any[], files: File[]): Promise<void[]> {
  return Promise.all(
    entries.map(
      (entry) =>
        new Promise<void>((resolve) => {
          if (entry.isFile) {
            entry.file(
              (file: File) => {
                // 保留 webkitRelativePath 便于后端处理同名文件
                if (file) {
                  (file as any).relativePath = entry.fullPath.replace(
                    /^\//,
                    '',
                  );
                  files.push(file);
                }
                resolve();
              },
              () => resolve(),
            );
          } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const readAll = () => {
              reader.readEntries(
                async (children: any[]) => {
                  if (!children.length) {
                    resolve();
                    return;
                  }
                  await traverseEntries(children, files);
                  readAll(); // readEntries 一次最多返回 100 条, 需循环读取
                },
                () => resolve(),
              );
            };
            readAll();
          } else {
            resolve();
          }
        }),
    ),
  );
}

export function useResourceUpload() {
  const resourceStore = useResourceStore();

  /** 处理拖拽放下事件 (支持文件夹递归) */
  async function handleResourceDrop(e: DragEvent): Promise<void> {
    resourceStore.rmDragging = false;
    if (resourceStore.rmUploading) return;

    const items = e.dataTransfer ? e.dataTransfer.items : null;
    const files: File[] = [];

    if (items && items.length && (items[0] as any).webkitGetAsEntry) {
      // 通过 FileSystemEntry 递归读取文件夹
      const entries: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = (items[i] as any).webkitGetAsEntry();
        if (entry) entries.push(entry);
      }
      await traverseEntries(entries, files);
    } else {
      // 退化: 仅普通文件列表
      const droppedFiles = e.dataTransfer
        ? Array.from(e.dataTransfer.files)
        : [];
      files.push(...droppedFiles);
    }

    if (files.length) {
      await resourceStore.uploadFiles(files);
    }
  }

  /** 处理文件选择 input change */
  function handleResourceFilePick(e: Event): void {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    if (files.length) resourceStore.uploadFiles(files);
    target.value = '';
  }

  return {
    handleResourceDrop,
    handleResourceFilePick,
  };
}
