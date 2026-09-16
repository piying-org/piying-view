<script setup lang="ts">
import { computed, unref } from 'vue';
import type { ShallowRef } from 'vue';
import { Field } from '@piying/view-vue';
import type { TestField } from '../util/field-fixture';
import type { Equal, IsAny } from '../util/type-assert';

const props = defineProps<{ field: TestField }>();

// 不写 path 的例子: 直接把叶子字段传进来
const text1Field = computed(() => props.field.get(['text1'])!);
type Text1Field = typeof text1Field.value;

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

// 不写 path: P 落到默认值 [], cvaa 的值类型就是传入字段自身的 value
function assertNoPathValue<V>(
  _cvaa: { value: V },
  _ok: Equal<V, ShallowRef<string | undefined>>,
): 'ok' {
  return 'ok';
}

// 不写 path: slot 的 field 就是传入的字段本身 (仍带 undefined, 因为显式传 path=[] 时运行时取不到)
function assertNoPathField<B>(
  _f: B,
  _ok: Equal<B, Text1Field | undefined>,
): 'ok' {
  return 'ok';
}

// 不写 path: valueChange 参数同样跟着字段 value
function assertNoPathChange<V>(
  _fn: (v: V) => void,
  _ok: Equal<V, string | undefined>,
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

  <!-- 不写 path -->
  <Field :field="text1Field" v-slot="{ cvaa, field: f }">
    <span class="t-nopath">{{ assertNoPathValue(cvaa, true) }}</span>
    <span class="t-nopath-field">{{ assertNoPathField(f, true) }}</span>
    <span class="t-nopath-change">{{ assertNoPathChange(cvaa.valueChange, true) }}</span>
    <input
      class="t-nopath-input"
      type="text"
      :value="unref(cvaa.value) ?? ''"
      @input="(e) => cvaa.valueChange((e.target as HTMLInputElement).value)"
      @blur="cvaa.touchedChange"
    />
    <span class="t-nopath-out">{{ unref(cvaa.value) ?? '(empty)' }}</span>
  </Field>
</template>
