import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { asVirtualGroup, layout, setAlias } from '@piying/view-angular-core';
import { rawConfig } from '@piying/view-angular-core';
import { keyEqual } from './util/key-equal';
import { assertFieldControl, assertFieldGroup } from './util/is-field';

// 用于测试fields和model变动时,数值是否正确
describe('layout', () => {
  it('移动布局', async () => {
    const define = v.intersect([
      v.pipe(v.object({}), setAlias('ly1')),
      v.object({
        input0: v.pipe(v.string()),
        input1: v.pipe(v.string(), layout({ keyPath: ['#', '@ly1'] })),
      }),
    ]);
    const list = createBuilder(define).fixedChildren!();
    expect(list.length).toEqual(2);
    expect(list[0].fixedChildren!().length).toEqual(1);
    expect(list[1].fixedChildren!().length).toEqual(1);
    keyEqual(list[0].fixedChildren!()[0].keyPath, 'input1');
    keyEqual(list[1].fixedChildren!()[0].keyPath, 'input0');
  });
  // 将子级提权到父级
  it('位置变化', () => {
    const obj = v.object({
      key1: v.pipe(
        v.object({
          test1: v.pipe(
            v.optional(v.string(), 'value1'),
            layout({ keyPath: ['#'], priority: 2 }),
          ),
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();

    expect(list.length).toBe(2);
    keyEqual(list[1].keyPath, ['key1', 'test1']);
  });
  it('设置alias', () => {
    const obj = v.pipe(
      v.intersect([
        v.pipe(v.object({}), setAlias('scope1')),
        v.object({
          key1: v.pipe(
            v.object({
              test1: v.pipe(
                v.optional(v.string(), 'value1'),
                layout({ keyPath: ['#', '@scope1'] }),
              ),
            }),
          ),
        }),
      ]),
    );
    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toBe(2);
    const item = list.find((item) => item.alias === 'scope1');
    expect(item).toBeTruthy();
    expect(item!.fixedChildren!().length).toBe(1);
    keyEqual(item!.fixedChildren!()[0].keyPath, ['key1', 'test1']);
  });
  it('设置alias(多个)', () => {
    const obj = v.pipe(
      v.intersect([
        v.pipe(v.object({}), setAlias('scope1')),
        v.object({
          key1: v.pipe(
            v.object({
              test1: v.pipe(
                v.optional(v.string(), 'value1'),
                layout({ keyPath: ['#', '@scope1'], priority: 2 }),
              ),
              test2: v.pipe(
                v.optional(v.string(), 'value2'),
                layout({ keyPath: ['#', '@scope1'], priority: 3 }),
              ),
            }),
          ),
        }),
      ]),
    );
    const resolved = createBuilder(obj);
    const list = resolved.fixedChildren!();
    expect(list.length).toBe(2);
    const item = list.find((item) => item.alias === 'scope1');
    expect(item).toBeTruthy();
    expect(item!.fixedChildren!().length).toBe(2);
    keyEqual(item!.fixedChildren!()[0].keyPath, ['key1', 'test1']);
    keyEqual(item!.fixedChildren!()[1].keyPath, ['key1', 'test2']);
  });
  it('非正常位置报错', () => {
    try {
      const obj = v.object({
        key1: v.pipe(
          v.object({
            test1: v.pipe(
              v.optional(v.string(), 'value1'),
              layout({ keyPath: ['#', 'a', 'b'] }),
            ),
          }),
        ),
      });
      const list = createBuilder(obj);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      return;
    }

    throw new Error('异常未捕获');
  });
  it('多级查询转移', () => {
    const obj = v.object({
      l1: v.object({
        l2: v.object({
          content1: v.pipe(
            v.string(),
            layout({ keyPath: ['#', 'l1'], priority: 2 }),
          ),
        }),
      }),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toBe(1);
    expect(list[0].fixedChildren?.().length).toBe(2);
    expect(list[0].fixedChildren?.()[0].fixedChildren?.().length).toEqual(0);
    keyEqual(list[0].fixedChildren?.()[1].keyPath, ['l2', 'content1']);
  });
  it('..查询', () => {
    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.object({
            content1: v.pipe(
              v.string(),
              layout({ keyPath: ['..', '..'], priority: 2 }),
            ),
          }),
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();

    expect(list.length).toBe(1);
    expect(list[0].fixedChildren?.().length).toBe(2);
    expect(list[0].fixedChildren?.()[0].fixedChildren?.().length).toBe(0);
    keyEqual(list[0].fixedChildren?.()[1].keyPath, ['l2', 'content1']);
  });
  it('alias转换', () => {
    const obj = v.intersect([
      v.pipe(
        v.intersect([
          v.pipe(
            v.object({
              test1: v.pipe(
                v.optional(v.string(), 'value1'),
                layout({ keyPath: ['#', '@abc'] }),
              ),
            }),
          ),
        ]),
        asVirtualGroup(),
        rawConfig((field) => {
          field.alias = 'abc';
          return field;
        }),
      ),
    ]);

    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toEqual(1);
    expect(list[0].fixedChildren?.().length).toBe(2);
    keyEqual(list[0].fixedChildren!()[1].keyPath, ['test1']);
  });
  it('权重检查正序', () => {
    const obj = v.pipe(
      v.intersect([
        v.pipe(v.object({}), setAlias('abc')),
        v.object({
          key1: v.pipe(
            v.object({
              test1: v.pipe(
                v.string(),
                layout({ keyPath: ['#', '@abc'], priority: 2 }),
              ),
              test2: v.pipe(
                v.string(),
                layout({ keyPath: ['#', '@abc'], priority: 3 }),
              ),
            }),
          ),
        }),
      ]),
      asVirtualGroup(),
    );

    const resolved = createBuilder(obj);
    const newField = resolved.get(['@abc']);
    expect(newField?.fixedChildren?.().length).toEqual(2);
    assertFieldGroup(newField?.form.control);
    assertFieldControl(newField?.fixedChildren!()[0].form.control);
    keyEqual(newField?.fixedChildren!()[0].keyPath, ['key1', 'test1']);
    assertFieldControl(newField?.fixedChildren!()[1].form.control);
    keyEqual(newField?.fixedChildren!()[1].keyPath, ['key1', 'test2']);
  });
  it('权重检查倒序', () => {
    const obj = v.pipe(
      v.intersect([
        v.pipe(v.object({}), setAlias('abc')),
        v.object({
          key1: v.pipe(
            v.object({
              test1: v.pipe(
                v.string(),
                layout({ keyPath: ['#', '@abc'], priority: 3 }),
              ),
              test2: v.pipe(
                v.string(),
                layout({ keyPath: ['#', '@abc'], priority: 2 }),
              ),
            }),
          ),
        }),
      ]),
      asVirtualGroup(),
    );
    const resolved = createBuilder(obj);
    const newField = resolved.get(['@abc']);
    expect(newField?.fixedChildren?.().length).toEqual(2);
    assertFieldGroup(newField?.form.control);
    assertFieldControl(newField?.fixedChildren!()[1].form.control);
    keyEqual(newField?.fixedChildren!()[1].keyPath, ['key1', 'test1']);
    assertFieldControl(newField?.fixedChildren!()[0].form.control);
    keyEqual(newField?.fixedChildren!()[0].keyPath, ['key1', 'test2']);
  });
});
