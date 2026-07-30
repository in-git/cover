// ===== 全局常量 =====
import type { CanvasDims, Platform } from '@/types';

/** 画布尺寸规范: B站 1920×1080 横屏, 抖音 1080×1920 竖屏 (9:16) */
export const CANVAS_DIMS: Record<Platform, CanvasDims> = {
  bilibili: { w: 1920, h: 1080 },
  douyin: { w: 1080, h: 1920 },
};

/** localStorage 中模板持久化的 key (Vue3 + Pinia 框架版本) */
export const TEMPLATES_STORAGE_KEY = 'cover_studio_templates';

/** 爆款标题推荐分组 */
export interface HotTitleGroup {
  /** 分类名 */
  category: string;
  /** IconPark 图标 key (HotTitleModal 中通过 iconMap 映射为组件) */
  icon: string;
  /** 该分类下的标题列表 */
  titles: string[];
}

/** 爆款标题推荐 (按话题分组, 点击应用到当前选中文字) */
export const HOT_TITLE_GROUPS: HotTitleGroup[] = [
  {
    category: '互联网话题',
    icon: 'globe',
    titles: [
      '全网爆火的AI工具，90%的人不知道',
      '我用AI做了个网站，结果出乎意料',
      'ChatGPT这5个隐藏玩法，效率提升10倍',
      'AI自动生成视频，普通人也能月入过万',
      '这个AI神器让我一周涨粉10万',
      'Sora震撼发布！视频行业要变天了',
      'AI取代不了这3种工作，看看有你吗',
      '程序员用AI写代码，一天干完一周的活',
      'AI画的图太逼真，根本分不清真假',
      '用AI做副业，这5个方向最赚钱',
      'AI一键生成PPT，打工人狂喜',
      '不会写代码？AI帮你做个App',
    ],
  },
  {
    category: '网页话题',
    icon: 'page-template',
    titles: [
      '这10个神仙网站，用过就回不去了',
      '免费看全网VIP视频的秘密武器',
      '一个被严重低估的宝藏网站',
      '前端工程师必收藏的10个网站',
      '这个在线工具让我效率翻倍',
      '原来网页还能这么玩？长见识了',
      '隐藏在浏览器里的10个黑科技',
      '无需下载！打开网页就能用的神器',
      '这个网站让我省了几千块会员费',
      '3分钟教你做一个自己的网站',
      'Chrome这些插件，用了就离不开了',
      '一个网站搞定所有设计需求',
    ],
  },
  {
    category: '通用爆款',
    icon: 'fire',
    titles: [
      '千万别学前端了！？',
      '我用AI一周赚了10W？',
      '3分钟带你彻底搞懂底层逻辑',
      '普通人如何逆袭实现财富自由',
      '全网都在搜的宝藏网站',
      '看了1000个爆款视频，我发现了这个秘密',
      '月入10万的人都在做什么？',
      '普通人翻身的最快路径',
    ],
  },
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
