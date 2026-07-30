import { defineConfig, presetUno, presetAttributify } from 'unocss'

// UnoCSS 配置: 原子化工具类 + 属性化模式 (图标改由 @icon-park/vue-next 按需引入)
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
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
