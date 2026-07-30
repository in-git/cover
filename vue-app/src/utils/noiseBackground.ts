// ===== 噪声背景图生成 (基于 SimplexNoise) =====
// 用分形布朗运动 (fBm) 叠加多层 simplex 噪声, 在预设调色板中插值,
// 输出 PNG dataURL, 作为画布背景图直接应用。
//
// 注意: simplex-noise 4.x 移除了 SimplexNoise 类, 改为 createNoise2D 函数式 API。
// 这里用 createNoise2D 包装出 SimplexNoise 类, 保留 `new SimplexNoise()` + `noise.noise2D()`
// 的经典用法, 同时享受 4.x 的性能与体积优势。
import { createNoise2D } from 'simplex-noise';

class SimplexNoise {
  private readonly _noise2D: (x: number, y: number) => number;
  constructor() {
    // 默认以 Math.random 为种子, 每次 new 都得到不同的噪声场
    this._noise2D = createNoise2D();
  }
  noise2D(x: number, y: number): number {
    return this._noise2D(x, y);
  }
}

/** 预设调色板 (每组 3-4 色, 生成时随机挑选) */
const PALETTES: string[][] = [
  ['#FF6B6B', '#FFE66D', '#4ECDC4'], // 红黄青
  ['#667EEA', '#764BA2', '#F093FB'], // 紫色梦幻
  ['#FA709A', '#FEE140', '#30CFD0'], // 暖冷渐变
  ['#0BA360', '#3CBA92', '#30CFD0'], // 翠绿青蓝
  ['#FF8008', '#FFC837', '#FF0080'], // 橙红霓虹
  ['#5EE7DF', '#B490CA', '#FF6B6B'], // 青紫粉
  ['#1A2980', '#26D0CE', '#A8EDEA'], // 深海蓝青
  ['#FDBB2D', '#22C1C3', '#3A1C71'], // 黄青紫
  ['#FF5F6D', '#FFC371', '#FF9A8B'], // 落日暖橙
  ['#21D4FD', '#B721FF', '#FFFFFF'], // 冰紫
  ['#0F2027', '#203A43', '#2C5364'], // 暗夜深蓝
  ['#EE9CA7', '#FFDDE1', '#B5FFFC'], // 粉柔
];

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '');
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  };
}

/** 在颜色数组中按 t∈[0, len-1] 线性插值取色 */
function lerpPalette(colors: RGB[], t: number): RGB {
  const clamped = Math.max(0, Math.min(colors.length - 1, t));
  const i = Math.floor(clamped);
  const f = clamped - i;
  const c1 = colors[i];
  const c2 = colors[Math.min(i + 1, colors.length - 1)];
  return {
    r: c1.r + (c2.r - c1.r) * f,
    g: c1.g + (c2.g - c1.g) * f,
    b: c1.b + (c2.b - c1.b) * f,
  };
}

/**
 * 生成一张 simplex 噪声渐变背景图, 返回 PNG dataURL。
 * - 每次调用使用新种子 (SimplexNoise 默认 Math.random), 输出唯一
 * - 双层 fBm 叠加, 配合随机调色板插值, 呈现柔和流体渐变
 *
 * @param width  输出图宽 (默认 480, 横屏)
 * @param height 输出图高 (默认 270, 横屏 16:9)
 */
export function generateNoiseBackground(width = 480, height = 270): string {
  // 每次新建实例 → 随机种子, 保证每次点击生成新图
  const noise = new SimplexNoise();
  const noise2 = new SimplexNoise();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 2D 上下文以生成噪声背景图');
  }

  const imgData = ctx.createImageData(width, height);
  const palette =
    PALETTES[Math.floor(Math.random() * PALETTES.length)].map(hexToRgb);

  // 噪声频率: 大尺度提供主体流向, 小尺度提供细节扰动
  const scale1 = 0.006;
  const scale2 = 0.018;
  // 随机偏移, 避免每次都从原点开始 (虽然种子已不同, 双保险)
  const ox = Math.random() * 1000;
  const oy = Math.random() * 1000;

  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // fBm: 主噪声 0.7 权重 + 细节噪声 0.3 权重, 范围 [-1, 1]
      let n = noise.noise2D((x + ox) * scale1, (y + oy) * scale1) * 0.7;
      n += noise2.noise2D((x + ox) * scale2, (y + oy) * scale2) * 0.3;
      // 归一化到 [0, 1]
      n = (n + 1) / 2;

      // 映射到调色板下标区间
      const t = n * (palette.length - 1);
      const c = lerpPalette(palette, t);

      const idx = (y * width + x) * 4;
      data[idx] = c.r;
      data[idx + 1] = c.g;
      data[idx + 2] = c.b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}
