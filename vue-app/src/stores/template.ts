// ===== 模板管理 store =====
// 模板列表 + 当前激活模板 + 增删
// 通过 pinia-plugin-persistedstate 持久化到 localStorage (替代原版 watch + setItem)
import type { Template } from '@/types';
import { TEMPLATES_STORAGE_KEY } from '@/utils/constants';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useTemplateStore = defineStore(
  'template',
  () => {
    // 持久化插件会在 store 创建后用 localStorage 中的值覆盖此初始值
    const templates = ref<Template[]>([]);
    const currentTemplateId = ref<number | null>(null);

    const currentTemplate = computed(
      () =>
        templates.value.find((t) => t.id === currentTemplateId.value) || null,
    );

    /** 新增空白模板 */
    function createEmptyTemplate(): Template {
      const newId = Date.now();
      const emptyTpl: Template = {
        id: newId,
        name: `空白模板 ${templates.value.length + 1}`,
        bgPreview: '#FFFFFF',
        bgColor: '#FFFFFF',
        bgImageUrl: null,
        bgImageOpacity: 1,
        bgFitMode: 'stretch',
        bilibili_json: { background: '#FFFFFF', objects: [] },
        douyin_json: { background: '#FFFFFF', objects: [] },
      };
      templates.value.push(emptyTpl);
      return emptyTpl;
    }

    /** 删除模板 (至少保留一个) */
    function deleteTemplate(index: number): boolean {
      if (templates.value.length <= 1) {
        alert('请至少保留一个模板！');
        return false;
      }
      templates.value.splice(index, 1);
      return true;
    }

    /** 根据当前模板 + 平台, 更新对应 json 字段与共享背景字段 (供 canvas store 调用) */
    function syncTemplateFromCanvas(
      platform: string,
      json: any,
      bg: {
        color: string;
        imageUrl: string | null;
        opacity: number;
        fitMode: string;
      },
    ) {
      const tpl = templates.value.find((t) => t.id === currentTemplateId.value);
      if (!tpl) return;
      tpl[`${platform}_json` as 'bilibili_json' | 'douyin_json'] = json;
      tpl.bgPreview = bg.color || '#FFFFFF';
      tpl.bgColor = bg.color || '#FFFFFF';
      tpl.bgImageUrl = bg.imageUrl;
      tpl.bgImageOpacity = bg.opacity;
      tpl.bgFitMode = bg.fitMode as Template['bgFitMode'];
    }

    return {
      templates,
      currentTemplateId,
      currentTemplate,
      createEmptyTemplate,
      deleteTemplate,
      syncTemplateFromCanvas,
    };
  },
  {
    // 持久化: 仅持久化 templates 列表到 localStorage (与原版 watch deep 行为一致)
    persist: {
      key: TEMPLATES_STORAGE_KEY,
      pick: ['templates'],
    },
  },
);
