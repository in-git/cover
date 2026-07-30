// ===== 键盘快捷键 composable =====
// 与原版 handleKeyDown 逻辑一致: ESC 关闭资源管理器, Delete 删除, Ctrl+C/V 复制粘贴, Ctrl+G 编组
import { onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useResourceStore } from '@/stores/resource'

export function useKeyboard(): void {
  const canvasStore = useCanvasStore()
  const resourceStore = useResourceStore()

  function handleKeyDown(e: KeyboardEvent): void {
    // 资源管理器打开时, ESC 关闭
    if (resourceStore.resourceModalOpen && e.key === 'Escape') {
      resourceStore.closeResourceManager()
      e.preventDefault()
      return
    }

    const activeTag = document.activeElement
      ? document.activeElement.tagName.toLowerCase()
      : ''
    if (activeTag === 'input' || activeTag === 'textarea') return
    const c = canvasStore.currentCanvas
    if (c && c.getActiveObject() && c.getActiveObject().isEditing) return

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

    if (e.key === 'Delete' || e.key === 'Backspace') {
      canvasStore.deleteObject()
      e.preventDefault()
    }

    if (ctrlOrCmd && e.key.toLowerCase() === 'c') {
      canvasStore.copyActiveObject()
      e.preventDefault()
    }

    if (ctrlOrCmd && e.key.toLowerCase() === 'v') {
      canvasStore.pasteObject()
      e.preventDefault()
    }

    if (ctrlOrCmd && (e.key === 'g' || e.key === 'G')) {
      if (e.shiftKey) canvasStore.ungroupObjects()
      else canvasStore.groupObjects()
      e.preventDefault()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
