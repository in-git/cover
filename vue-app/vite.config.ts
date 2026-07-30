import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import UnoCSS from 'unocss/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue({
      template: {
        // iconify-icon 是 Web Component, 告诉 Vue 编译器不要将其视为 Vue 组件
        compilerOptions: {
          isCustomElement: (tag) => tag === 'iconify-icon',
        },
      },
    }),
    UnoCSS(),
    // 按需引入 ant-design-vue 组件 (4.x 使用 CSS-in-JS, 无需引入样式文件)
    Components({
      dts: 'src/components.d.ts',
      resolvers: [AntDesignVueResolver({ importStyle: false })],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 将前端 /api 与 /uploads 请求代理到 Flask 后端, 避免跨域
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
