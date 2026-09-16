<script setup lang="ts">
import { unref } from 'vue';
import type { ShallowRef } from 'vue';
import { Field } from '@piying/view-vue';
import type { TestField } from '../util/field-fixture';
import type { Equal, IsAny } from '../util/type-assert';

defineProps<{ field: TestField }>();

// text1: cvaa.value 恰好是 ShallowRef<string | undefined>, 且 f 不是 any
function assertText1<V, B>(
  _cvaa: { value: V },
  _f: B,
  _ok1: IsAny<B> extends false ? true : never,
  _ok2: Equal<V, ShallowRef<string | undefined>>,
): 'ok' {
  return 'ok';
}

// text1: valueChange 只接受 string | undefined
function assertChangeArg<V>(
  _fn: (v: V) => void,
  _ok: Equal<V, string | undefined>,
): 'ok' {
  return 'ok';
}

// number1: cvaa.value 恰好是 ShallowRef<number>
function assertNumber1<V>(
  _cvaa: { value: V },
  _ok: Equal<V, ShallowRef<number>>,
): 'ok' {
  return 'ok';
}
</script>

<template>
  <Field :field="field" :path="['text1']" v-slot="{ cvaa, field: f }">
    <span class="t-assert">{{ assertText1(cvaa, f, true, true) }}</span>
    <span class="t-change">{{ assertChangeArg(cvaa.valueChange, true) }}</span>
    <input
      class="t-text"
      type="text"
      :value="unref(cvaa.value) ?? ''"
      @input="(e) => cvaa.valueChange((e.target as HTMLInputElement).value)"
      @blur="cvaa.touchedChange"
    />
    <span class="t-out">{{ unref(cvaa.value) ?? '(empty)' }}</span>
  </Field>

  <Field :field="field" :path="['number1']" v-slot="{ cvaa }">
    <span class="t-num">{{ assertNumber1(cvaa, true) }}</span>
  </Field>
</template>
