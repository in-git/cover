import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import UnoCSS from 'unocss/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  base: './',
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
    port: 8989,
    open: true,
    // 开发模式: 将后端 API 与上传资源代理到 Flask (5000)
    // 生产模式: 由 server.py 直接托管 vue-app/dist/, 无需此代理
    proxy: {
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
