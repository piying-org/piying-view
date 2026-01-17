import type { BaseMetadata } from 'valibot';

export interface NonFieldControlAction<
  TInput = unknown,
> extends BaseMetadata<TInput> {
  readonly type: 'nonFieldControl';
  readonly reference: typeof nonFieldControl;
  readonly value: boolean;
}

export function nonFieldControl<TInput>(
  value = true,
): NonFieldControlAction<TInput> {
  return {
    kind: 'metadata',
    type: 'nonFieldControl',
    reference: nonFieldControl,
    value: value,
  };
}
