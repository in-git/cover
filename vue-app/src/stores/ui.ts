// ===== UI 状态 store =====
// 右侧属性面板选项卡 + 爆款标题 popover 开关 + 字体选择器 popover 开关
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  /** 右侧属性面板选项卡: component=组件配置, background=背景配置 */
  const activeTab = ref<'component' | 'background'>('component');
  /** 爆款标题 popover 开关 */
  const showHotTitles = ref(false);
  /** 字体选择器 popover 开关 (组件配置面板, 文字元素) */
  const showFontPicker = ref(false);

  function setTab(tab: 'component' | 'background') {
    activeTab.value = tab;
  }

  function toggleHotTitles(force?: boolean) {
    showHotTitles.value = force ?? !showHotTitles.value;
  }

  /** 切换字体选择器 popover (force 不传则切换) */
  function toggleFontPicker(force?: boolean) {
    showFontPicker.value = force ?? !showFontPicker.value;
  }

  return {
    activeTab,
    showHotTitles,
    showFontPicker,
    setTab,
    toggleHotTitles,
    toggleFontPicker,
  };
});
