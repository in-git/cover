/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// iconify-icon 是 Web Component, 声明为全局自定义元素, 避免 Vue 将其视为未知组件
declare module 'iconify-icon' {
  import type { DefineCustomElement } from 'vue';
  const IconifyIcon: DefineCustomElement<Record<string, unknown>>;
  export default IconifyIcon;
}
