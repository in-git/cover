// ===== 资源管理器 store =====
// 资源管理器模态框 + 图片/字体列表 + 上传/删除 + 侧边栏快选
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { ResourceItem, ResourceCategory } from '@/types'
import {
  fetchResources as apiFetchResources,
  uploadFiles as apiUploadFiles,
  deleteResource as apiDeleteResource
} from '@/api/resource'
import { ensureFontLoaded } from '@/utils/font'

export const useResourceStore = defineStore('resource', () => {
  // ===== 资源管理器模态框状态 =====
  const resourceModalOpen = ref(false)
  const rmActiveTab = ref<ResourceCategory>('images')
  const resourceList = reactive<{ images: ResourceItem[]; fonts: ResourceItem[] }>({
    images: [],
    fonts: []
  })
  const rmDragging = ref(false)
  const rmUploading = ref(false)
  const rmProgressPct = ref(0)
  const rmUploadStatus = ref('')

  // ===== 侧边栏本地图片快选 =====
  const localImages = ref<ResourceItem[]>([])
  const loadingBackgrounds = ref(false)

  // 兼容旧引用 (无操作)
  const publicBackgrounds = ref<ResourceItem[]>([])
  const categories = ref<string[]>([])
  const selectedCategory = ref('')
  const allBackgrounds = ref<ResourceItem[]>([])

  /** 获取资源列表 (图片 + 字体), 同时刷新侧边栏快选与字体预加载 */
  async function fetchResources(): Promise<void> {
    loadingBackgrounds.value = true
    try {
      const result = await apiFetchResources()
      if (result.success) {
        const data = result.data as { images: ResourceItem[]; fonts: ResourceItem[] }
        resourceList.images = data.images || []
        resourceList.fonts = data.fonts || []
        // 侧边栏快选只展示图片 (最多 30 张)
        localImages.value = resourceList.images.slice(0, 30)
        // 预加载字体, 使预览立即生效
        resourceList.fonts.forEach((f) => ensureFontLoaded(f))
      }
    } catch (e) {
      console.error('获取资源列表失败:', e)
    }
    loadingBackgrounds.value = false
  }

  function openResourceManager(): void {
    resourceModalOpen.value = true
    fetchResources()
  }

  function closeResourceManager(): void {
    resourceModalOpen.value = false
  }

  /** 批量上传文件 (支持进度回调) */
  async function uploadFiles(files: File[]): Promise<void> {
    rmUploading.value = true
    rmProgressPct.value = 0
    rmUploadStatus.value = `准备上传 ${files.length} 个文件...`

    let validCount = 0
    files.forEach((f) => {
      if (!f || !f.name) return
      if (/^\./.test(f.name) && !/^\.\w+$/.test(f.name)) return
      validCount++
    })

    if (validCount === 0) {
      rmUploading.value = false
      return
    }

    try {
      rmUploadStatus.value = `上传中... 0 / ${validCount}`
      const result = await apiUploadFiles(files, (pct) => {
        rmProgressPct.value = pct
        rmUploadStatus.value = `上传中... ${pct}%`
      })

      if (result.success) {
        rmUploadStatus.value = `完成: 上传 ${result.uploaded?.length || 0}, 跳过 ${result.skipped?.length || 0}`
        await fetchResources()
        setTimeout(() => {
          rmUploading.value = false
        }, 800)
      } else {
        rmUploadStatus.value = `失败: ${result.error || '未知错误'}`
        setTimeout(() => {
          rmUploading.value = false
        }, 2000)
      }
    } catch (e: any) {
      console.error('上传失败:', e)
      rmUploadStatus.value = `上传失败: ${e.message}`
      setTimeout(() => {
        rmUploading.value = false
      }, 2000)
    }
  }

  /** 删除资源 */
  async function deleteResource(res: ResourceItem): Promise<void> {
    if (!confirm(`确定删除「${res.name}」?`)) return
    try {
      const result = await apiDeleteResource(res.category, res.name)
      if (result.success) {
        await fetchResources()
      } else {
        alert('删除失败: ' + (result.error || ''))
      }
    } catch (e: any) {
      alert('删除失败: ' + e.message)
    }
  }

  // 兼容旧引用
  function fetchPublicBackgrounds(): void {
    fetchResources()
  }
  function fetchCategories(): void {}
  function filterByCategory(): void {}

  return {
    resourceModalOpen,
    rmActiveTab,
    resourceList,
    rmDragging,
    rmUploading,
    rmProgressPct,
    rmUploadStatus,
    localImages,
    loadingBackgrounds,
    publicBackgrounds,
    categories,
    selectedCategory,
    allBackgrounds,
    fetchResources,
    openResourceManager,
    closeResourceManager,
    uploadFiles,
    deleteResource,
    fetchPublicBackgrounds,
    fetchCategories,
    filterByCategory
  }
})
