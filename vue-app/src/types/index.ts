// ===== 全局类型定义 =====

/** 平台类型: B站横屏 / 抖音竖屏 */
export type Platform = 'bilibili' | 'douyin';

/** 背景图适配模式: stretch=拉伸填满 | contain=原比例完整显示(留白) | cover=原比例覆盖(裁剪) */
export type BgFitMode = 'stretch' | 'contain' | 'cover';

/** 画布尺寸规范 */
export interface CanvasDims {
  w: number;
  h: number;
}

/** 资源分类 */
export type ResourceCategory = 'images' | 'fonts';

/** 资源项 (图片/字体) */
export interface ResourceItem {
  name: string;
  size: number;
  ext: string;
  category: ResourceCategory;
  url: string;
  updatedAt?: number;
}

/** 单个模板结构 (兼容旧版单 json 字段, 已在加载时迁移为 bilibili_json + douyin_json) */
export interface Template {
  id: number;
  name: string;
  /** 模板卡片预览色 (与 bgColor 同步, 兼容旧字段) */
  bgPreview: string;
  /** 画布背景色 */
  bgColor?: string;
  /** 共享背景图 URL */
  bgImageUrl?: string | null;
  /** 背景图透明度 */
  bgImageOpacity?: number;
  /** 背景图适配模式 */
  bgFitMode?: BgFitMode;
  /** B站画布 JSON */
  bilibili_json?: { background: string; objects: any[] };
  /** 抖音画布 JSON */
  douyin_json?: { background: string; objects: any[] };
  /** 旧版单 json 字段 (迁移后删除) */
  json?: any;
}

/** 上传接口返回 */
export interface UploadResult {
  success: boolean;
  uploaded?: ResourceItem[];
  skipped?: string[];
  count?: number;
  error?: string;
}

/** 资源列表接口返回 */
export interface ResourceListResult {
  success: boolean;
  data: { images: ResourceItem[]; fonts: ResourceItem[] } | ResourceItem[];
}

/** 右侧属性面板当前选中元素的属性镜像 */
export interface ActiveProps {
  fill: string;
  fontSize: number;
  opacity: number;
  textValue: string;
  /** 当前文字字体 family (用于字体选择器高亮当前项) */
  fontFamily: string;
}
