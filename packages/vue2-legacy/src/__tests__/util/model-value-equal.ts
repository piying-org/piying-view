import type { Wrapper } from '@vue/test-utils';
import { expect } from 'vitest';

export function modelValueEqual(instance: Wrapper<any>, value: any) {
  expect((instance.emitted()['update:modelValue'] as any)[0][0]).deep.eq(value);
}
