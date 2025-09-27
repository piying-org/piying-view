import { DynamicComponentConfig } from '../type/component';

export function getComponentCheckConfig(a: DynamicComponentConfig) {
  return {
    ...a,
    inputs: Object.keys(a.inputs() ?? {}).join(','),
    // todo 需要等修改为动态的再比较key
    attributes: Object.entries(a.attributes() ?? {})
      .map((key, value) => `${key}:${value}`)
      .join(','),
    directives: a.directives
      ? a.directives.map((config) => ({
          ...config,
          inputs: `${config.inputs ? Object.keys(config.inputs()).join(',') : ''}`,
        }))
      : undefined,
  };
}

export type ComponentCheckConfig = ReturnType<typeof getComponentCheckConfig>;
