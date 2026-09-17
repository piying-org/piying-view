import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import * as v from 'valibot';
import { NFCSchema, type PiFieldAtPath } from '@piying/view-angular-core';
import { typedComponent } from '../lib/util/typed-component';
import { typedFieldComponentPipe } from '../lib/util/typed-field-component-pipe';
import { createSchemaComponent } from './util/create-component';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type IsAny<T> = 0 extends 1 & T ? true : false;

/** 每个 output 的 payload 类型互不相同, 用来证明 list 类型确实跟着 output<T>() 走 */
@Component({
  selector: 'test-typed-emit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="te-str" (click)="strOut.emit('hello')"></button>
    <button class="te-num" (click)="numOut.emit(42)"></button>
    <button class="te-obj" (click)="objOut.emit({ id: 7, tag: 'x' })"></button>
    <button class="te-arr" (click)="arrOut.emit(['a', 'b'])"></button>
  `,
})
export class TypedEmitComponent {
  strOut = output<string>();
  numOut = output<number>();
  objOut = output<{ id: number; tag: string }>();
  arrOut = output<string[]>();
}

/** 零 output 组件: 跨字段监听时拿不到目标组件, 自身监听又没名字可收 */
@Component({
  selector: 'test-no-out',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="no-out"></span>`,
})
export class NoOutComponent {}

const typeDefine = typedComponent({
  types: {
    typedEmit: { type: TypedEmitComponent },
    plain: { type: NoOutComponent },
  },
});

const root = v.object({ a: NFCSchema, b: NFCSchema });

/** 非法 output 名只参与编译期校验: 运行期真去挂监听器会被 Angular 直接抱 NG0316 */
const RUN_ILLEGAL: boolean = false;

/** outputChange 回调只在 allFieldsResolved 时执行, 必须渲染组件才能让它真正跑到 */
async function render(merged: typeof root) {
  const { fixture, element } = await createSchemaComponent(
    signal(merged),
    signal({ a: undefined, b: undefined }),
    typeDefine.define,
  );
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, element };
}

describe('outputChange — list 类型来自 Angular output<T>()', () => {
  it('类型: 每一位精确等于该 output 的 payload 元组', async () => {
    const checks: boolean[][] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([
            { list: undefined, output: 'strOut' },
            { list: undefined, output: 'numOut' },
            { list: undefined, output: 'objOut' },
            { list: undefined, output: 'arrOut' },
          ]).subscribe(({ list }) => {
            const t1: Equal<(typeof list)[0], [string] | undefined> = true;
            const t2: Equal<(typeof list)[1], [number] | undefined> = true;
            const t3: Equal<
              (typeof list)[2],
              [{ id: number; tag: string }] | undefined
            > = true;
            const t4: Equal<(typeof list)[3], [string[]] | undefined> = true;
            checks.push([t1, t2, t3, t4]);
          });
        }),
      ]),
    ]);

    const { element } = await render(merged);
    element.querySelector<HTMLElement>('.te-str')!.click();

    expect(checks).toEqual([[true, true, true, true]]);
  });

  it('类型: 没有退化成 any, 且各位互不相同(不是统一塞的宽松类型)', async () => {
    const checks: boolean[][] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([
            { list: undefined, output: 'strOut' },
            { list: undefined, output: 'numOut' },
          ]).subscribe(({ list }) => {
            const notAny: [
              IsAny<(typeof list)[0]>,
              IsAny<NonNullable<(typeof list)[0]>[0]>,
            ] = [false, false];
            const distinct: Equal<(typeof list)[0], (typeof list)[1]> = false;
            checks.push([...notAny, distinct]);
          });
        }),
      ]),
    ]);

    const { element } = await render(merged);
    element.querySelector<HTMLElement>('.te-str')!.click();

    expect(checks).toEqual([[false, false, false]]);
  });

  it('类型: payload 用错类型直接报错(类型退化成 any 时这条会失效)', async () => {
    const collected: unknown[][] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([
            { list: undefined, output: 'strOut' },
            { list: undefined, output: 'numOut' },
            { list: undefined, output: 'objOut' },
          ]).subscribe(({ list }) => {
            // @ts-expect-error numOut 的 payload 是 number, 不是 string
            const wrong1: string = list[1]?.[0];
            // @ts-expect-error strOut 的 payload 是 string, 不是 number
            const wrong2: number = list[0]?.[0];
            // @ts-expect-error objOut 的 payload 没有 name 属性
            const wrong3: string = list[2]?.[0]?.name;
            collected.push([wrong1, wrong2, wrong3]);
          });
        }),
      ]),
    ]);

    const { element } = await render(merged);
    element.querySelector<HTMLElement>('.te-num')!.click();
    element.querySelector<HTMLElement>('.te-str')!.click();

    // 类型没撒谎: 运行期拿到的就是各自 output 真正 emit 的值
    expect(collected.length).toBe(2);
    expect(collected[0][0]).toBe(42);
    expect(collected[1][1]).toBe('hello');
  });

  it('类型: listenFields 逐位精确到路径对应的 field', async () => {
    const checks: boolean[][] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([
            { list: undefined, output: 'strOut' },
            { list: ['..', 'b'], output: 'numOut' },
          ]).subscribe(({ listenFields }) => {
            const f0: Equal<
              (typeof listenFields)[0],
              PiFieldAtPath<typeof root, ['a']>
            > = true;
            const f1: Equal<
              (typeof listenFields)[1],
              PiFieldAtPath<typeof root, ['b']>
            > = true;
            const notAny: IsAny<(typeof listenFields)[1]> = false;
            checks.push([f0, f1, notAny]);
          });
        }),
      ]),
      d(['b'], 'typedEmit', []),
    ]);

    const { element } = await render(merged);
    element.querySelector<HTMLElement>('.te-str')!.click();

    expect(checks).toEqual([[true, true, false]]);
  });

  it('运行时: emit 值原样落在对应位, 未触发的位是 undefined', async () => {
    const emissions: any[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([
            { list: undefined, output: 'strOut' },
            { list: undefined, output: 'numOut' },
            { list: undefined, output: 'objOut' },
            { list: undefined, output: 'arrOut' },
          ]).subscribe((s) => emissions.push(s));
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ a: undefined, b: undefined }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(emissions.length).toBe(0);

    element.querySelector<HTMLElement>('.te-str')!.click();
    expect(emissions.length).toBe(1);
    let list = emissions[0].list;
    expect(list[0]).toEqual(['hello']);
    expect(list[1]).toBeUndefined();
    expect(list[2]).toBeUndefined();
    expect(list[3]).toBeUndefined();

    element.querySelector<HTMLElement>('.te-obj')!.click();
    list = emissions[emissions.length - 1].list;
    expect(list[0]).toEqual(['hello']);
    expect(list[2]).toEqual([{ id: 7, tag: 'x' }]);
    expect(list[1]).toBeUndefined();
  });

  it('运行时: list 里没有多余的 field, field 统一从 listenFields 取', async () => {
    const emissions: any[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'numOut' }]).subscribe((s) =>
            emissions.push(s),
          );
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ a: undefined, b: undefined }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    element.querySelector<HTMLElement>('.te-num')!.click();
    const s = emissions[emissions.length - 1];
    expect(s.list[0].length).toBe(1);
    expect(s.list[0][0]).toBe(42);
    expect(s.listenFields[0].fullPath).toEqual(['a']);
  });

  it('运行时: 同一 output 被多个 outputChange 监听, 每位只含 emit 参数(不累积 field)', async () => {
    const first: any[] = [];
    const second: any[] = [];
    const userArgCount: number[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputs.set({
          strOut: (...args: any[]) => userArgCount.push(args.length),
        }),
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'strOut' }]).subscribe((s) =>
            first.push(s.list[0]),
          );
        }),
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'strOut' }]).subscribe((s) =>
            second.push(s.list[0]),
          );
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ a: undefined, b: undefined }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    element.querySelector<HTMLElement>('.te-str')!.click();
    expect(first[0]).toEqual(['hello']);
    expect(second[0]).toEqual(['hello']);
    // 用户 handler 也只收到 emit 参数, 没有追加的 field
    expect(userArgCount).toEqual([1]);
  });

  it('运行时: 跨字段监听, 只有被监听字段触发才发射', async () => {
    const emissions: any[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([{ list: ['..', 'b'], output: 'arrOut' }]).subscribe((s) =>
            emissions.push(s),
          );
        }),
      ]),
      d(['b'], 'typedEmit', []),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ a: undefined, b: undefined }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const arrBtns = element.querySelectorAll<HTMLElement>('.te-arr');
    expect(arrBtns.length).toBe(2);

    arrBtns[0].click();
    expect(emissions.length).toBe(0);

    arrBtns[1].click();
    expect(emissions.length).toBe(1);
    expect(emissions[0].field.fullPath).toEqual(['a']);
    expect(emissions[0].listenFields[0].fullPath).toEqual(['b']);
    expect(emissions[0].list[0]).toEqual([['a', 'b']]);
  });

  it('类型: 零 output 组件跨字段监听, output 名不再塌成 never', async () => {
    const checks: boolean[][] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'plain', [
        d.outputChange((fn) => {
          fn([{ list: ['..', 'b'], output: 'arrOut' }]).subscribe(
            ({ listenFields }) => {
              const f0: Equal<
                (typeof listenFields)[0],
                PiFieldAtPath<typeof root, ['b']>
              > = true;
              checks.push([f0]);
            },
          );
        }),
      ]),
      d(['b'], 'typedEmit', []),
    ]);

    const { element } = await render(merged);
    element.querySelector<HTMLElement>('.te-arr')!.click();

    expect(checks).toEqual([[true]]);
  });

  it('类型: 监听自身(list 缺省)仍然锁在本组件 output() 上', async () => {
    let registered = 0;
    const checks: unknown[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'plain', [
        d.outputChange((fn) => {
          registered++;
          if (RUN_ILLEGAL) {
            // @ts-expect-error NoOutComponent 一个 output 也没有
            fn([{ list: undefined, output: 'arrOut' }]);
          }
        }),
      ]),
      d(['b'], 'typedEmit', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'strOut' }]).subscribe(({ list }) =>
            checks.push(list[0]?.[0]),
          );
        }),
      ]),
    ]);

    const { element } = await render(merged);
    element.querySelector<HTMLElement>('.te-str')!.click();

    expect(element.querySelectorAll('.no-out').length).toBe(1);
    expect(registered).toBe(1);
    expect(checks).toEqual(['hello']);
  });

  it('运行时: 零 output 组件跨字段监听, 照样收到对方 emit 的参数', async () => {
    const emissions: any[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'plain', [
        d.outputChange((fn) => {
          fn([{ list: ['..', 'b'], output: 'numOut' }]).subscribe((s) =>
            emissions.push(s),
          );
        }),
      ]),
      d(['b'], 'typedEmit', []),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ a: undefined, b: undefined }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelectorAll('.no-out').length).toBe(1);
    element.querySelector<HTMLElement>('.te-num')!.click();

    expect(emissions.length).toBe(1);
    expect(emissions[0].field.fullPath).toEqual(['a']);
    expect(emissions[0].listenFields[0].fullPath).toEqual(['b']);
    expect(emissions[0].list[0]).toEqual([42]);
  });
});
