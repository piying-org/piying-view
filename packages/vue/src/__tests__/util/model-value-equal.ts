import type { VueWrapper } from '@vue/test-utils';
import { expect } from 'vitest';

export function modelValueEqual(instance: VueWrapper<any>, value: any) {
  expect((instance.emitted()['update:modelValue'] as any)[0][0]).deep.eq(value);
}
