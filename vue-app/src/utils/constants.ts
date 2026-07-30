// ===== 全局常量 =====
import type { CanvasDims, Platform } from '@/types';

/** 画布尺寸规范: B站 1920×1080 横屏, 抖音 1080×1920 竖屏 (9:16) */
export const CANVAS_DIMS: Record<Platform, CanvasDims> = {
  bilibili: { w: 1920, h: 1080 },
  douyin: { w: 1080, h: 1920 },
};

/** localStorage 中模板持久化的 key (Vue3 + Pinia 框架版本) */
export const TEMPLATES_STORAGE_KEY = 'cover_studio_templates';

/** 爆款标题推荐列表 */
export const HOT_TITLES = [
  '千万别学前端了！？',
  '我用AI一周赚了10W？',
  '3分钟带你彻底搞懂底层逻辑',
  '普通人如何逆袭实现财富自由',
  '全网都在搜的宝藏网站',
];

/** 文字预设颜色 */
export const FILL_PRESET_COLORS = ['#FEC000', '#EFEFEF', '#00C0FF'];

/** 字体扩展名 -> @font-face format 映射 */
export const FONT_FORMAT_MAP: Record<string, string> = {
  '.woff2': 'woff2',
  '.woff': 'woff',
  '.ttf': 'truetype',
  '.otf': 'opentype',
};
