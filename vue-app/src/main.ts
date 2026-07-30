// ===== 应用入口 =====
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'virtual:uno.css'
// 全局样式 (原 style.css, macOS Sonoma 风格)
import './styles/main.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
// Pinia 持久化插件: 替代原版 localStorage 手动读写, 自动同步 store 状态到 localStorage
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')
