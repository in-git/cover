// ===== 资源管理 REST API 封装 =====
// 通过 Vite proxy 代理到 Flask 后端 (http://localhost:5000), 前端无需写绝对地址
import type { ResourceListResult, UploadResult, ResourceCategory } from '@/types'

/** 获取资源列表 (图片 + 字体) */
export async function fetchResources(): Promise<ResourceListResult> {
  const resp = await fetch('/api/resources')
  return resp.json()
}

/** 批量上传文件 (multipart/form-data) */
export function uploadFiles(
  files: File[],
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const formData = new FormData()
  let validCount = 0
  files.forEach((f) => {
    if (!f || !f.name) return
    // 跳过 macOS 隐藏文件
    if (/^\./.test(f.name) && !/^\.\w+$/.test(f.name)) return
    formData.append('files', f, f.name)
    validCount++
  })

  if (validCount === 0) {
    return Promise.resolve({ success: false, error: '无有效文件' })
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText))
      } catch (e) {
        reject(e)
      }
    }
    xhr.onerror = () => reject(new Error('网络错误'))
    xhr.send(formData)
  })
}

/** 删除指定资源 */
export async function deleteResource(
  category: ResourceCategory,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const resp = await fetch(
    `/api/resources/${category}/${encodeURIComponent(name)}`,
    { method: 'DELETE' }
  )
  return resp.json()
}
