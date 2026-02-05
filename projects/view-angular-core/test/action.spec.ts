import * as v from 'valibot';
import {
  actions,
  asVirtualGroup,
  condition,
  layout,
  mergeHooks,
  patchHooks,
  removeHooks,
  setComponent,
} from '../index';
import { rawConfig } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { assertFieldControl } from './util/is-field';
import { isEmpty } from './util/is-empty';
import { keyEqual } from './util/key-equal';
import { nonFieldControl } from '@piying/view-angular-core';
import { signal } from '@angular/core';

// 用于测试fields和model变动时,数值是否正确
describe('action', () => {
  it('默认条件', () => {
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        condition({
          environments: ['default'],
          actions: [
            rawConfig((item) => {
              item.type = 'abc';
              return item;
            }),
          ],
        }),
      ),
    });
    const list = createBuilder(obj, { types: ['abc'] }).fixedChildren!();
    expect(list.length).toBe(1);
    assertFieldControl(list[0].form.control);

    // expect(list[0].type).toBe('abc');
  });

  it('title', async () => {
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        v.title('title1'),
        rawConfig((field) => {
          field.props['k2'] = 'value2';

          return field;
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list[0].props()).toEqual({ title: 'title1', k2: 'value2' });
  });
  it('description', async () => {
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        v.description('title1'),
        rawConfig((field) => {
          field.props['k2'] = 'value2';

          return field;
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list[0].props()).toEqual({ description: 'title1', k2: 'value2' });
  });
  it('options覆盖', async () => {
    const obj = v.pipe(
      v.picklist(['1', '2']),
      rawConfig((field) => {
        field.props['options'] = [1];

        return field;
      }),
    );
    const ressolved = createBuilder(obj);
    expect(ressolved.props()['options']).toEqual([1]);
  });
  it('metadata', async () => {
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        v.metadata({ v1: 'title1' }),
        rawConfig((field) => {
          field.props['k2'] = 'value2';

          return field;
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list[0].props()).toEqual({
      metadata: { v1: 'title1' },
      k2: 'value2',
    });
  });
  it('title-picklist', async () => {
    const obj = v.object({
      key1: v.pipe(
        v.picklist([]),
        v.title('title1'),
        rawConfig((field) => {
          field.props['k2'] = 'value2';

          return field;
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect((list[0].props() as any)['title']).toBe('title1');
    expect((list[0].props() as any)['k2']).toBe('value2');
  });

  it('交叉移动', async () => {
    const obj = v.intersect([
      v.pipe(v.object({ k1: v.pipe(v.string(), layout({ keyPath: ['#'] })) })),
      v.pipe(v.object({ k2: v.pipe(v.string(), layout({ keyPath: ['#'] })) })),
    ]);
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(4);
  });
  it('中间移动', async () => {
    const obj = v.object({
      k1: v.string(),
      o1: v.object({
        k2: v.pipe(v.string(), layout({ keyPath: ['..', '..'] })),
      }),
      k3: v.string(),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(4);
    keyEqual(result[0].keyPath, 'k1');
    keyEqual(result[1].keyPath, ['o1']);
    keyEqual(result[2].keyPath, ['o1', 'k2']);
    keyEqual(result[3].keyPath, ['k3']);
  });
  it('交叉移动后group变成空', async () => {
    const obj = v.intersect([
      v.object({
        data: v.pipe(
          v.intersect([
            v.pipe(v.object({}), layout({ priority: 2, keyPath: ['#'] })),
            v.pipe(v.object({}), layout({ priority: 3, keyPath: ['#'] })),
          ]),
          asVirtualGroup(),
        ),
      }),
    ]);
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(3);
    expect(result[0].fixedChildren!()[0].fixedChildren?.().length).toBe(0);
    expect(result[1].fixedChildren?.().length).toBe(0);
    expect(result[2].fixedChildren?.().length).toBe(0);
  });
  it('权重修改(正常)', async () => {
    const obj = v.object({
      k1: v.pipe(v.string(), layout({ priority: 1 })),
      k2: v.pipe(v.string(), layout({ priority: 2 })),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(2);
    keyEqual(result[0].keyPath, 'k1');
    keyEqual(result[1].keyPath, 'k2');
  });
  it('权重修改(reverse)', async () => {
    const obj = v.object({
      k1: v.pipe(v.string(), layout({ priority: 2 })),
      k2: v.pipe(v.string(), layout({ priority: 1 })),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(2);
    keyEqual(result[0].keyPath, 'k2');
    keyEqual(result[1].keyPath, 'k1');
  });
  it('配置覆盖', async () => {
    let index = 0;
    const obj = v.object({
      key1: v.pipe(
        v.pipe(
          v.string(),
          v.title('title1'),
          rawConfig((field, context) => {
            field.type = '1';
            index++;
            return field;
          }),
          rawConfig((field, context) => {
            expect(field.type).toBe('1');
            field.type = '2';
            index++;
            return field;
          }),
        ),
        rawConfig((field, context) => {
          expect(field.type).toBe('2');
          field.type = '3';
          index++;
          return field;
        }),
      ),
    });
    const result = createBuilder(obj, {
      context: { value: 1 },
      types: ['3'],
    }).fixedChildren!();
    assertFieldControl(result[0].form.control);

    // expect(result[0].type).toBe('3');
    expect(index).toBe(3);
  });
  it('actions.inputs.set', () => {
    const index = 0;
    const obj = v.pipe(
      v.string(),
      actions.inputs.set({ v: 1 }),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    expect(resolved.inputs()).toEqual({ v: 1 });
    const obj2 = v.pipe(
      v.string(),
      actions.inputs.set({ v: 1 }),
      actions.inputs.patch({ k: 2 }),
      setComponent('mock-input'),
    );
    const resolved2 = createBuilder(obj2);
    expect(resolved2.inputs()).toEqual({ v: 1, k: 2 });
    const obj3 = v.pipe(
      v.string(),
      actions.inputs.set({ v: 1 }),
      actions.inputs.patch({ k: 2 }),
      actions.inputs.remove(['v']),
      setComponent('mock-input'),
    );
    const resolved3 = createBuilder(obj3);
    expect(resolved3.inputs()).toEqual({ k: 2 });
  });
  it('attributes', () => {
    const config = { types: ['string'] };
    const obj = v.pipe(v.string(), actions.attributes.set({ v: 1 }));
    const resolved = createBuilder(obj, config);
    expect(resolved.attributes()).toEqual({ v: 1 });
    expect(resolved.define!()?.attributes?.()).toEqual({ v: 1 });
    const obj2 = v.pipe(
      v.string(),
      actions.attributes.set({ v: 1 }),
      actions.attributes.patch({ k: 2 }),
    );
    const resolved2 = createBuilder(obj2, config);
    expect(resolved2.attributes()).toEqual({ v: 1, k: 2 });
    const obj3 = v.pipe(
      v.string(),
      actions.attributes.set({ v: 1 }),
      actions.attributes.patch({ k: 2 }),
      actions.attributes.remove(['v']),
    );
    const resolved3 = createBuilder(obj3, config);
    expect(resolved3.attributes()).toEqual({ k: 2 });
  });
  it('patch async attributes', () => {
    const config = { types: ['string'] };
    const obj = v.pipe(
      v.string(),
      actions.attributes.patchAsync({ v: () => 1, v2: () => signal(2) }),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj, config);
    expect(resolved.attributes()).toEqual({ v: 1, v2: 2 });
  });
  it('actions.outputs.set', () => {
    let fn1CallCount = 0;
    let fn2CallCount = 0;
    const fn = (value: any) => {
      expect(typeof value).toEqual('number');
      fn1CallCount++;
    };
    const fn2 = (value: any) => {
      expect(typeof value).toEqual('number');
      fn2CallCount++;
    };
    const obj = v.pipe(
      v.string(),
      actions.outputs.set({ v: fn }),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    resolved.outputs()['v'](1);
    expect(fn1CallCount).toEqual(1);
    const obj2 = v.pipe(
      v.string(),
      setComponent('mock-input'),
      actions.outputs.set({ v: fn }),
      actions.outputs.patch({ k: fn2 }),
    );
    const resolved2 = createBuilder(obj2);
    resolved2.outputs()['v'](2);
    resolved2.outputs()['k'](2);
    expect(fn1CallCount).toEqual(2);
    expect(fn2CallCount).toEqual(1);

    const obj3 = v.pipe(
      v.string(),
      setComponent('mock-input'),
      actions.outputs.set({ v: fn }),
      actions.outputs.patch({ k: fn }),
      actions.outputs.remove(['v']),
    );
    const resolved3 = createBuilder(obj3);
    expect(Object.keys(resolved3.outputs())).toEqual(['k']);
  });
  it('actions.outputs.patchAsync', () => {
    let fn1CallCount = 0;
    const obj = v.pipe(
      v.string(),
      actions.outputs.patchAsync({
        v: (field) => (value: any) => {
          expect(typeof value).toEqual('number');
          expect(field).toBeTruthy();

          fn1CallCount++;
        },
      }),
      setComponent('mock-input'),
    );
    const resolved = createBuilder(obj);
    resolved.outputs()['v'](1);
    expect(fn1CallCount).toEqual(1);
  });
  it('wrappers', () => {
    const options = { wrappers: ['w1', 'w2', 'w3'] };
    const obj = v.pipe(v.string(), actions.wrappers.set(['w1', 'w2']));
    const resolved = createBuilder(obj, options);
    expect(resolved.wrappers().map((item) => item.type)).toEqual(['w1', 'w2']);

    resolved.wrappers().forEach((item, index) => {
      expect(item.type).toBe(`w${index + 1}`);
      isEmpty(item.inputs());
      isEmpty(item.attributes());
    });

    const obj2 = v.pipe(
      v.string(),
      actions.wrappers.set(['w1', 'w2']),
      actions.wrappers.patchAsync('w3'),
    );
    const resolved2 = createBuilder(obj2, options);
    expect(resolved2.wrappers().map((item) => item.type)).toEqual([
      'w1',
      'w2',
      'w3',
    ]);
    expect(resolved2.wrappers().length).toBe(3);
    resolved2.wrappers().forEach((item, index) => {
      expect(item.type).toBe(`w${index + 1}`);
      isEmpty(item.inputs());
      isEmpty(item.attributes());
    });
    const obj3 = v.pipe(
      v.string(),
      actions.wrappers.set(['w1', 'w2']),
      actions.wrappers.patchAsync('w3'),
      actions.wrappers.remove(['w1']),
    );
    const resolved3 = createBuilder(obj3, options);
    expect(resolved3.wrappers().map((item) => item.type)).toEqual(['w2', 'w3']);
    resolved3.wrappers().forEach((item, index) => {
      expect(item.type).toBe(`w${index + 2}`);
      isEmpty(item.inputs());
      isEmpty(item.attributes());
    });
  });
  it('merge hooks', () => {
    let m1 = 0;
    let m2 = 0;
    const obj = v.pipe(
      v.string(),
      mergeHooks({
        fieldResolved: (field) => {
          expect(field).toBeTruthy();
          m1 = 1;
        },
      }),
      mergeHooks({
        fieldResolved: (field) => {
          expect(field).toBeTruthy();
          expect(m1).toEqual(1);
          m2 = 2;
        },
      }),
    );
    const resolved = createBuilder(obj);
    expect(m1).toEqual(1);
    expect(m2).toEqual(2);
  });
  it('merge hooks', () => {
    let m1 = 0;
    let m2 = 0;
    const obj = v.pipe(
      v.string(),
      mergeHooks({
        fieldResolved: (field) => {
          expect(field).toBeTruthy();
          m1 = 1;
        },
      }),
      mergeHooks({
        fieldResolved: (field) => {
          expect(field).toBeTruthy();
          expect(m1).toEqual(1);
          m2 = 2;
        },
      }),
      removeHooks(['fieldResolved']),
    );
    const resolved = createBuilder(obj);
    expect(m1).toEqual(0);
    expect(m2).toEqual(0);
  });
  it('patchHooks', () => {
    let m1 = 0;
    let m2 = 0;
    const obj = v.pipe(
      v.string(),
      patchHooks({
        fieldResolved: (field) => {
          expect(field).toBeTruthy();
          m1 = 1;
        },
      }),
      patchHooks({
        fieldResolved: (field) => {
          expect(field).toBeTruthy();
          expect(m1).toEqual(0);
          m2 = 2;
        },
      }),
    );
    const resolved = createBuilder(obj);
    expect(m1).toEqual(0);
    expect(m2).toEqual(2);
  });
  it('nonFieldControl', async () => {
    const obj = v.object({
      key1: v.pipe(v.string(), nonFieldControl()),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toEqual(1);
    expect(list[0].form.control).toBeFalsy();
  });
  it('defaultAction', async () => {
    const obj = v.pipe(v.string(), setComponent('test1'));
    const field = createBuilder(obj, {
      types: {
        test1: {
          type: Symbol(),
          actions: [v.title('testTitle')],
        },
      },
    });
    expect(field).toBeTruthy();
    expect(field.props()['title']).toEqual('testTitle');
  });
  it('defaultAction-componenttype', async () => {
    const obj = v.pipe(v.string(), setComponent('test1'));
    const field = createBuilder(obj, {
      types: {
        test1: {
          actions: [setComponent('mock-input'), v.title('testTitle')],
        },
      },
    });
    expect(field).toBeTruthy();
    expect(field.props()['title']).toEqual('testTitle');
  });
});
