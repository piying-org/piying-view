import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { asVirtualGroup, formConfig, layout } from '@piying/view-angular-core';
import { keyEqual } from './util/key-equal';
import {
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from './util/is-field';

// 用于测试fields和model变动时,数值是否正确
describe('对象相交', () => {
  it('intersect', () => {
    const obj = v.object({
      key1: v.intersect([
        v.pipe(v.optional(v.object({ foo: v.number() }))),
        v.object({ bar: v.number() }),
      ]),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toBe(1);
    // expect(result[0].type).toBe('intersect');
    expect(result[0].fieldGroup!().length).toBe(2);
    expect(result[0].fieldGroup!()[0].fieldGroup?.().length ?? 0).toBe(1);
    expect(result[0].fieldGroup!()[1].fieldGroup?.().length ?? 0).toBe(1);
    assertFieldLogicGroup(result[0].form.control);
  });
  it('intersect转移位置', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.intersect([
          // 第1个
          v.pipe(
            v.optional(
              v.object({
                foo: v.pipe(v.number()),
              }),
            ),
            layout({
              keyPath: ['#'],
              priority: 9,
            }),
          ),
          // 第2个
          v.object({ bar: v.number() }),
        ]),
      }),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toBe(2);
    keyEqual(
      result[0].fieldGroup!()[0].fieldGroup!()[0].fieldGroup!()[0].keyPath,
      'bar',
    );
    keyEqual(result[1].keyPath, ['l1', 'l2', 0]);
    // expect(result[1].type).toBe('object');
    assertFieldGroup(result[1].form.control);
    expect(result[1].fieldGroup?.().length).toBe(1);
    keyEqual(result[1].fieldGroup!()[0].keyPath, 'foo');
  });
  it('intersect内部转移位置', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.intersect([
          // 第1个
          v.pipe(
            v.optional(
              v.object({
                foo: v.pipe(
                  v.number(),
                  layout({
                    keyPath: ['#'],
                    priority: 9,
                  }),
                ),
              }),
            ),
          ),
          // 第2个
          v.object({ bar: v.number() }),
        ]),
      }),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toBe(2);
    keyEqual(
      result[0].fieldGroup!()[0].fieldGroup!()[1].fieldGroup!()[0].keyPath,
      'bar',
    );
    keyEqual(result[1].keyPath, ['l1', 'l2', 0, 'foo']);
    // expect(result[1].type).toBe('number');
    assertFieldControl(result[1].form.control);
    expect(result[1].fieldGroup?.().length ?? 0).toBe(0);
  });
  it('子级使用vGroup', async () => {
    const obj = v.object({
      l1: v.pipe(
        v.intersect([
          // 第1个
          v.object({
            v1: v.string(),
          }),
          // 第2个
          v.object({
            v2: v.number(),
          }),
        ]),
        asVirtualGroup(),
      ),
    });
    const result = createBuilder(obj).fieldGroup!();

    expect(result.length).toBe(1);
    assertFieldGroup(result[0].form.control);

    expect(result[0].fieldGroup?.().length).toBe(2);
    assertFieldGroup(result[0].fieldGroup!()[0].form.control);
    assertFieldGroup(result[0].fieldGroup!()[1].form.control);
  });
  it('交叉时同对象下不同key', () => {
    const obj = v.intersect([
      v.object({ k1: v.object({ k2: v.string() }) }),
      v.object({ k1: v.object({ k3: v.string() }) }),
    ]);
    const result = createBuilder(obj);

    assertFieldLogicGroup(result.form.control);
    assertFieldGroup(result.fieldGroup!()[0].form.control);
    assertFieldGroup(result.fieldGroup!()[1].form.control);
    keyEqual(result.fieldGroup!()[0].fieldGroup!()[0].keyPath, 'k1');
    keyEqual(
      result.fieldGroup!()[0].fieldGroup!()[0].fieldGroup!()[0].keyPath,
      'k2',
    );
    keyEqual(result.fieldGroup!()[1].fieldGroup!()[0].keyPath, 'k1');
    keyEqual(
      result.fieldGroup!()[1].fieldGroup!()[0].fieldGroup!()[0].keyPath,
      'k3',
    );
  });

  it('intersect转移位置', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.pipe(
          v.intersect([
            v.pipe(
              v.string(),
              layout({
                keyPath: ['#'],
                priority: 10,
              }),
            ),
            v.number(),
          ]),
          layout({
            keyPath: ['#'],
            priority: 9,
          }),
        ),
      }),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toEqual(3);
    keyEqual(result[1].keyPath, ['l1', 'l2']);
    keyEqual(result[2].keyPath, ['l1', 'l2', 0]);
    expect(result[1].fieldGroup?.().length).toEqual(1);
    keyEqual(result[1].fieldGroup!()[0].keyPath, 1);
  });
  it('or转移位置', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.pipe(
          v.union([
            v.pipe(
              v.string(),
              layout({
                keyPath: ['#'],
                priority: 10,
              }),
            ),
            v.number(),
          ]),
          layout({
            keyPath: ['#'],
            priority: 9,
          }),
        ),
      }),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toEqual(3);

    keyEqual(result[1].keyPath, ['l1', 'l2']);
    keyEqual(result[2].keyPath, ['l1', 'l2', 0]);
    expect(result[1].fieldGroup?.().length).toEqual(1);
    keyEqual(result[1].fieldGroup!()[0].keyPath, 1);
  });

  it('intersect转移位置2层', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.pipe(
          v.intersect([
            v.pipe(
              v.intersect([v.pipe(v.string())]),
              layout({
                keyPath: ['#'],
                priority: 10,
              }),
            ),
          ]),
          layout({
            keyPath: ['#'],
            priority: 9,
          }),
        ),
      }),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toEqual(3);
    keyEqual(result[1].keyPath, ['l1', 'l2']);
    keyEqual(result[2].keyPath, ['l1', 'l2', 0]);
    expect(result[1].fieldGroup?.().length ?? 0).toEqual(0);
    expect(result[2].fieldGroup?.().length ?? 0).toEqual(1);
  });
  it('intersect转移位置2层混合', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.pipe(
          v.intersect([
            v.pipe(
              v.union([v.pipe(v.string())]),
              layout({
                keyPath: ['#'],
                priority: 10,
              }),
            ),
          ]),
          layout({
            keyPath: ['#'],
            priority: 9,
          }),
        ),
      }),
    });
    const result = createBuilder(obj).fieldGroup!();
    expect(result.length).toEqual(3);
    keyEqual(result[1].keyPath, ['l1', 'l2']);
    keyEqual(result[2].keyPath, ['l1', 'l2', 0]);
    expect(result[1].fieldGroup?.().length ?? 0).toEqual(0);
    expect(result[2].fieldGroup?.().length ?? 0).toEqual(1);
  });
  it('对象合并', () => {
    const obj = v.pipe(
      v.intersect([
        v.object({
          v1: v.object({
            k1: v.string(),
          }),
        }),
        v.object({
          v1: v.object({
            k2: v.string(),
          }),
        }),
      ]),
      asVirtualGroup(),
    );

    const resolved = createBuilder(obj);
    assertFieldGroup(resolved.form.control);
    expect(Object.keys(resolved.form.control.controls).length).toBe(1);
    assertFieldGroup(resolved.form.control.controls['v1']);
    expect(
      Object.keys(resolved.form.control.controls['v1'].controls).length,
    ).toBe(2);
    assertFieldControl(resolved.form.control.controls['v1'].controls['k1']);
    assertFieldControl(resolved.form.control.controls['v1'].controls['k2']);
  });

  it('toModel/toView', async () => {
    let index = 0;
    const obj = v.pipe(
      v.intersect([
        v.pipe(
          v.object({
            k1: v.string(),
          }),
        ),
      ]),
      formConfig({
        transfomer: {
          toModel(value, control) {
            if (value) {
              expect(value).toEqual({ k1: '2' });
              index++;
            }
            return { k1: '3' };
          },
          toView(value, control) {
            expect(value).toEqual({ k1: '1' });
            index++;
            return { k1: '2' };
          },
        },
      }),
    );

    const result = createBuilder(obj);
    result.form.control?.updateValue({ k1: '1' });
    expect(result.form.control?.value$$()).toEqual({ k1: '3' });
    expect(index).toEqual(2);
  });
  it('root union', () => {
    const obj = v.union([v.string(), v.number()]);
    const result = createBuilder(obj);
    expect(result.fieldGroup!().length).toBe(2);
    assertFieldLogicGroup(result.form.control);
    expect(result.form.control.type()).toBe('or');
  });
});
