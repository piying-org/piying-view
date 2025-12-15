import { DynamicComponentConfig } from '../type/component';

export function getComponentCheckConfig(a: DynamicComponentConfig) {
  return {
    ...a,
    inputs: Object.keys(a.inputs() ?? {}).join(','),
    directives: a.directives
      ? a.directives.map((config) => ({
          ...config,
          inputs: `${config.inputs ? Object.keys(config.inputs()).join(',') : ''}`,
        }))
      : undefined,
    attributes: '',
    events: '',
  };
}

export type ComponentCheckConfig = ReturnType<typeof getComponentCheckConfig>;
