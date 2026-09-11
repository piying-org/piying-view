export type FrameworkKey = 'angular' | 'vue' | 'react' | 'svelte' | 'solid';

export interface FrameworkMeta {
  /** 用于 URL 片段的 key */
  key: FrameworkKey;
  name: string;
  /** npm 包名 */
  pkg: string;
  /** 模板仓库 */
  template: string;
  /** 一句话说明的 i18n key */
  descKey: `framework.${FrameworkKey}.desc`;
}

const TEMPLATE_BASE = 'https://github.com/piying-org';

export const frameworks: FrameworkMeta[] = [
  {
    key: 'angular',
    name: 'Angular',
    pkg: '@piying/view-angular',
    template: `${TEMPLATE_BASE}/piying-view-angular-template`,
    descKey: 'framework.angular.desc',
  },
  {
    key: 'vue',
    name: 'Vue',
    pkg: '@piying/view-vue',
    template: `${TEMPLATE_BASE}/piying-view-vue-template`,
    descKey: 'framework.vue.desc',
  },
  {
    key: 'react',
    name: 'React',
    pkg: '@piying/view-react',
    template: `${TEMPLATE_BASE}/piying-view-react-template`,
    descKey: 'framework.react.desc',
  },
  {
    key: 'svelte',
    name: 'Svelte',
    pkg: '@piying/view-svelte',
    template: `${TEMPLATE_BASE}/piying-view-svelte-template`,
    descKey: 'framework.svelte.desc',
  },
  {
    key: 'solid',
    name: 'Solid',
    pkg: '@piying/view-solid',
    template: `${TEMPLATE_BASE}/piying-view-solid-template`,
    descKey: 'framework.solid.desc',
  },
];

export const frameworkByKey = new Map(frameworks.map((f) => [f.key, f]));
