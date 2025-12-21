import { DynamicComponentConfig } from '../type/component';

export function getComponentCheckConfig(a: DynamicComponentConfig) {
  return {
    ...a,
    inputs: Object.keys(a.inputs() ?? {}).join(','),
    directives: a.directives
      ? a.directives.map((config) => ({
          ...config,
          inputs: `${config.inputs ? Object.keys(config.inputs() ?? {}).join(',') : ''}`,
        }))
      : undefined,
    // todo 这里是为了schema被替换时,进行比较,感觉应该有更好的方法
    attributes: Object.entries(a.attributes() ?? {})
      .map((key, value) => `${key}:${value}`)
      .join(','),
    events: Object.keys(a.events() ?? {}).join(','),
    outputs: Object.keys(a.events() ?? {}).join(','),
  };
}

export type ComponentCheckConfig = ReturnType<typeof getComponentCheckConfig>;
