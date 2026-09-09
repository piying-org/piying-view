import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeNova from 'starlight-theme-nova';
import mdx from '@astrojs/mdx';
import angular from '@analogjs/astro-angular';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeNova from 'starlight-theme-nova';
import mdx from '@astrojs/mdx';
import angular from '@analogjs/astro-angular';
import tailwindcss from '@tailwindcss/vite';

const base = '/piying-view/';

export default defineConfig({
  output: 'static',
  base,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    angular({
      useAngularHydration: false,
      vite: {
        transformFilter: (_code, id) => {
          return (
            id.includes('src/components') ||
            id.includes('view-angular') ||
            id.includes('node_modules')
          );
        },
        tsconfig: './tsconfig.app.json',
      },
    }),
    starlight({
      title: 'Piying-View 文档',
      customCss: ['./src/styles/global.css'],
      plugins: [
        starlightThemeNova({
          nav: [
            { label: '快速上手', href: '/getting-started/quick-start/' },
            { label: 'API 参考', href: '/api/control-api/' },
          ],
        }),
      ],
      sidebar: [
        {
          label: '入门使用',
          items: [
            { label: '快速上手', link: '/getting-started/quick-start/' },
            { label: '两种使用模式', link: '/getting-started/two-modes/' },
            { label: '核心概念', link: '/getting-started/core-concept/' },
            { label: 'Options 配置', link: '/getting-started/options-config/' },
            {
              label: '框架差异',
              link: '/getting-started/framework-differences/',
            },
            { label: 'JSON Schema 支持', link: '/getting-started/jsonschema/' },
            // {
            //   label: 'Astro 集成 Angular Demo',
            //   link: '/getting-started/astro-angular-demo/',
            // },
          ],
        },
        {
          label: '业务场景',
          items: [
            {
              label: '类型映射（定义即表单）',
              link: '/scenarios/type-mapping/',
            },
            { label: '表单使用', link: '/scenarios/form-use/' },
            { label: '组件使用', link: '/scenarios/component-use/' },
            { label: '基础字段定义', link: '/scenarios/basic-field/' },
            { label: '复杂 Schema 结构', link: '/scenarios/complex-schema/' },
            {
              label: 'asControl / asVirtualGroup',
              link: '/scenarios/as-control-group/',
            },
            { label: '动态字段控制', link: '/scenarios/dynamic-fields/' },
            { label: '值转换与联动', link: '/scenarios/value-transform/' },
            { label: '自定义验证', link: '/scenarios/custom-validation/' },
            { label: '数组高级用法', link: '/scenarios/array-advanced/' },
            {
              label: 'Record Schema 动态对象组',
              link: '/scenarios/record-dynamic-group/',
            },
            {
              label: '综合示例：完整业务表单',
              link: '/scenarios/complete-example/',
            },
          ],
        },
        {
          label: 'API 参考',
          items: [
            { label: 'setComponent', link: '/api/setcomponent/' },
            { label: 'inputs', link: '/api/inputs/' },
            { label: 'outputs', link: '/api/outputs/' },
            { label: 'models', link: '/api/models/' },
            { label: 'events', link: '/api/events/' },
            { label: 'attributes', link: '/api/attributes/' },
            { label: 'CSS class', link: '/api/css-class/' },
            { label: 'Layout metadata', link: '/api/layout/' },
            {
              label: 'hideWhen / disableWhen / valueChange',
              link: '/api/hide-disable/',
            },
            { label: '路径查询', link: '/api/path-querying/' },
            { label: 'FieldFormConfig', link: '/api/field-config/' },
            { label: 'fieldGlobalConfig', link: '/api/global-config/' },
            { label: 'Hooks 生命周期', link: '/api/hooks/' },
            { label: 'Props 通用属性', link: '/api/props/' },
            { label: '核心工具函数', link: '/api/core-utils/' },
            { label: 'Wrappers 包装器', link: '/api/wrappers/' },
            { label: 'Control API', link: '/api/control-api/' },
            { label: 'Providers 服务注入', link: '/api/providers/' },
          ],
        },
        {
          label: 'Angular 专属',
          items: [
            { label: 'API 索引', link: '/angular/api/' },
            { label: '组件', link: '/angular/components/' },
            { label: '指令', link: '/angular/directives/' },
            { label: '字段指令配置', link: '/angular/field-directives/' },
            { label: 'Token', link: '/angular/tokens/' },
            { label: '工具函数', link: '/angular/tools/' },
            { label: 'BaseControl', link: '/angular/base-control/' },
          ],
        },
        {
          label: '框架适配',
          items: [
            { label: 'Vue', link: '/adapters/vue/' },
            { label: 'React', link: '/adapters/react/' },
            { label: 'Solid', link: '/adapters/solid/' },
            { label: 'Svelte', link: '/adapters/svelte/' },
            {
              label: '字段模型绑定（React）',
              link: '/adapters/field-model-binding-react/',
            },
            {
              label: '字段模型绑定（Solid）',
              link: '/adapters/field-model-binding-solid/',
            },
            { label: 'Vue 强类型组件', link: '/adapters/vue-typed-component/' },
          ],
        },
      ],
      head: [
        {
          tag: 'base',
          attrs: {
            href: base,
          },
        },
      ],
    }),
  ],
});
