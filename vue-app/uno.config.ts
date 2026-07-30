import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

// UnoCSS 配置: 原子化工具类 + 属性化模式 + 图标 (lucide 图标集)
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ],
  // 自定义主题变量, 与 main.css 中 --accent 等保持一致
  theme: {
    colors: {
      accent: '#0071e3',
      'accent-hover': '#0077ed',
      danger: '#ff3b30'
    }
  }
})
