import type { BaseMetadata } from 'valibot';
import { KeyPath } from '../../util';

export interface LayoutAction<TInput = unknown> extends BaseMetadata<TInput> {
  readonly type: 'layout';
  readonly reference: typeof layout;
  readonly value: {
    keyPath?: KeyPath;
    priority?: number;
  };
}

export function layout<TInput>(
  value: LayoutAction['value'],
): LayoutAction<TInput> {
  return {
    kind: 'metadata',
    type: 'layout',
    reference: layout,
    value: value,
  };
}
