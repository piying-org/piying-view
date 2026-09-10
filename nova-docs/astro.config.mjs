import { readdirSync, statSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeNova from 'starlight-theme-nova';
import mdx from '@astrojs/mdx';
import angular from '@analogjs/astro-angular';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const base = '/piying-view/';

// 侧边栏标签：中文为 label，英文通过 translations 提供
// link 不需要带语言前缀，Starlight 会按当前语言自动补 zh/ 或 en/
const nav = (zh, en, link) => ({
  label: zh,
  translations: { en },
  link,
});

// 顶部导航：href 由主题原样输出，需要自己拼语言前缀（相对 <base>）
const navHref = (path) => ({
  'zh-CN': `zh/${path}`,
  en: `en/${path}`,
});

// 中文文档已整体迁入 docs/zh/，为旧地址（/api/xxx/）保留跳转
const legacyRedirects = Object.fromEntries(
  (function walk(dir, out = []) {
    for (const name of readdirSync(`./src/content/docs/zh/${dir}`)) {
      const rel = dir ? `${dir}/${name}` : name;
      if (statSync(`./src/content/docs/zh/${rel}`).isDirectory())
        walk(rel, out);
      else if (/\.(md|mdx)$/.test(name)) {
        const path = rel.replace(/\.(md|mdx)$/, '').replace(/(^|\/)index$/, '');
        if (!path) continue;
        out.push([`/${path}/`, `${base}zh/${path}/`]);
      }
    }
    return out;
  })(''),
);

export default defineConfig({
  output: 'static',
  base,
  redirects: legacyRedirects,
  vite: {
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: './node_modules/monaco-editor/min/**/*',
            dest: './lib/monaco-editor',
            rename: { stripBase: 3 },
          },
        ],
      }),
    ],
  },
  integrations: [
    mdx(),
    angular({
      useAngularHydration: false,
      vite: {
        transformFilter: (_code, id) => {
          return id.replace(/\\/g, '/').includes('/src/angular/');
        },
        tsconfig: './tsconfig.app.json',
      },
    }),
    starlight({
      title: {
        'zh-CN': 'Piying-View 文档',
        en: 'Piying-View Docs',
      },
      customCss: ['./src/styles/global.css'],
      components: {
        PageTitle: './src/overrides/starlight/PageTitle.astro',
      },
      defaultLocale: 'zh',
      locales: {
        zh: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      plugins: [
        starlightThemeNova({
          nav: [
            {
              label: { 'zh-CN': '快速上手', en: 'Getting Started' },
              href: navHref('getting-started/quick-start/'),
            },
            {
              label: { 'zh-CN': 'API 参考', en: 'API Reference' },
              href: navHref('api/control-api/'),
            },
            {
              label: { 'zh-CN': 'Playground', en: 'Playground' },
              href: navHref('playground/'),
            },
            {
              label: { 'zh-CN': 'JSON Playground', en: 'JSON Playground' },
              href: navHref('json-playground/'),
            },
          ],
        }),
      ],
      sidebar: [
        nav('Playground 游乐场', 'Playground', 'playground/'),
        nav('JSON Schema 游乐场', 'JSON Schema Playground', 'json-playground/'),
        {
          label: '入门使用',
          translations: { en: 'Getting Started' },
          items: [
            nav('快速上手', 'Quick Start', '/getting-started/quick-start/'),
            nav(
              '两种使用模式',
              'Two Usage Modes',
              '/getting-started/two-modes/',
            ),
            nav('核心概念', 'Core Concepts', '/getting-started/core-concept/'),
            nav(
              'Options 配置',
              'Options Configuration',
              '/getting-started/options-config/',
            ),
            nav(
              '框架差异',
              'Framework Differences',
              '/getting-started/framework-differences/',
            ),
            nav(
              'JSON Schema 支持',
              'JSON Schema Support',
              '/getting-started/jsonschema/',
            ),
          ],
        },
        {
          label: '业务场景',
          translations: { en: 'Scenarios' },
          items: [
            nav(
              '类型映射（定义即表单）',
              'Type Mapping (Definition Is the Form)',
              '/scenarios/type-mapping/',
            ),
            nav('表单使用', 'Using Forms', '/scenarios/form-use/'),
            nav('组件使用', 'Using Components', '/scenarios/component-use/'),
            nav(
              '基础字段定义',
              'Basic Field Definition',
              '/scenarios/basic-field/',
            ),
            nav(
              '复杂 Schema 结构',
              'Complex Schema Structures',
              '/scenarios/complex-schema/',
            ),
            nav(
              'asControl / asVirtualGroup',
              'asControl / asVirtualGroup',
              '/scenarios/as-control-group/',
            ),
            nav(
              '动态字段控制',
              'Dynamic Field Control',
              '/scenarios/dynamic-fields/',
            ),
            nav(
              '值转换与联动',
              'Value Transformation & Linkage',
              '/scenarios/value-transform/',
            ),
            nav(
              '自定义验证',
              'Custom Validation',
              '/scenarios/custom-validation/',
            ),
            nav(
              '数组高级用法',
              'Advanced Array Usage',
              '/scenarios/array-advanced/',
            ),
            nav(
              'Record Schema 动态对象组',
              'Record Schema Dynamic Groups',
              '/scenarios/record-dynamic-group/',
            ),
            nav(
              '综合示例：完整业务表单',
              'Complete Example: a Real Business Form',
              '/scenarios/complete-example/',
            ),
          ],
        },
        {
          label: 'API 参考',
          translations: { en: 'API Reference' },
          items: [
            nav('setComponent', 'setComponent', '/api/setcomponent/'),
            nav('inputs', 'inputs', '/api/inputs/'),
            nav('outputs', 'outputs', '/api/outputs/'),
            nav('models', 'models', '/api/models/'),
            nav('events', 'events', '/api/events/'),
            nav('attributes', 'attributes', '/api/attributes/'),
            nav('CSS class', 'CSS class', '/api/css-class/'),
            nav('Layout metadata', 'Layout metadata', '/api/layout/'),
            nav(
              'hideWhen / disableWhen / valueChange',
              'hideWhen / disableWhen / valueChange',
              '/api/hide-disable/',
            ),
            nav('路径查询', 'Path Querying', '/api/path-querying/'),
            nav('FieldFormConfig', 'FieldFormConfig', '/api/field-config/'),
            nav(
              'fieldGlobalConfig',
              'fieldGlobalConfig',
              '/api/global-config/',
            ),
            nav('Hooks 生命周期', 'Hooks Lifecycle', '/api/hooks/'),
            nav('Props 通用属性', 'Props Generic Properties', '/api/props/'),
            nav('核心工具函数', 'Core Utilities', '/api/core-utils/'),
            nav('Wrappers 包装器', 'Wrappers', '/api/wrappers/'),
            nav('Control API', 'Control API', '/api/control-api/'),
            nav('Providers 服务注入', 'Providers', '/api/providers/'),
          ],
        },
        {
          label: 'Angular 专属',
          translations: { en: 'Angular Only' },
          items: [
            nav('API 索引', 'API Index', '/angular/api/'),
            nav('组件', 'Components', '/angular/components/'),
            nav('指令', 'Directives', '/angular/directives/'),
            nav(
              '字段指令配置',
              'Field Directive Configuration',
              '/angular/field-directives/',
            ),
            nav('Token', 'Tokens', '/angular/tokens/'),
            nav('工具函数', 'Utilities', '/angular/tools/'),
            nav('BaseControl', 'BaseControl', '/angular/base-control/'),
          ],
        },
        {
          label: '框架适配',
          translations: { en: 'Framework Adapters' },
          items: [
            nav('Vue', 'Vue', '/adapters/vue/'),
            nav('React', 'React', '/adapters/react/'),
            nav('Solid', 'Solid', '/adapters/solid/'),
            nav('Svelte', 'Svelte', '/adapters/svelte/'),
            nav(
              '字段模型绑定（React）',
              'Field Model Binding (React)',
              '/adapters/field-model-binding-react/',
            ),
            nav(
              '字段模型绑定（Solid）',
              'Field Model Binding (Solid)',
              '/adapters/field-model-binding-solid/',
            ),
            nav(
              'Vue 强类型组件',
              'Vue Typed Components',
              '/adapters/vue-typed-component/',
            ),
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
