import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { Test1Component } from './test1/test1.component';
import * as v from 'valibot';
import { setComponent, formConfig, actions } from '@piying/view-angular-core';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { getField } from './util/action';
describe('组件默认配置', () => {
  //todo 全局配置去掉,但是还需要加一个支持批量配置的
  xit('全局', async () => {
    // todo 原
    // let define = v.object({
    //   v1: v.pipe(
    //     v.string(),
    //     formConfig({
    //       disabled: true,
    //     }),
    //   ),
    // });
    // const fields$ = Promise.withResolvers();
    // const { fixture, instance, element } = await createSchemaComponent(
    //   signal([
    //     {
    //       type: 'test1',
    //       key: 'v1',
    //       formConfig: signal({
    //         disabled: true,
    //       }),
    //     },
    //   ]),
    //   signal({ v1: 'd1' }),
    //   {
    //     defaultConfig: {
    //       inputs: {
    //         input1: 'test1',
    //       },
    //       outputs: {
    //         output3: (value) => {
    //           fields$.resolve(true);
    //         },
    //       },
    //     },
    //   },
    // );
    // await fixture.whenStable();
    // fixture.detectChanges();
    // await fields$.promise;
    // expect(element.querySelector('.test1-div-input1')?.innerHTML).toBe('test1');
  });
  // todo 表单配置应该支持signal
  it('组件级', async () => {
    const fields$ = Promise.withResolvers();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test2'),
        formConfig({
          disabled: true,
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            type: Test1Component,
            actions: [
              actions.inputs.set({ input1: 'test1' }),
              actions.outputs.set({
                output3: (value) => {
                  expect(value()).toBeTruthy();
                  expect(value().origin).toBeTruthy();
                  fields$.resolve(true);
                },
              }),
            ],
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fields$.promise;
    expect(element.querySelector('.test1-div-input1')?.innerHTML).toBe('test1');
  });
  it('props', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(v.string(), setComponent('test2'), getField(fields$)),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            type: Test1Component,
            actions: [actions.props.patchAsync({ value: () => 1 })],
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    expect(field.props()).toEqual({ value: 1 });
  });
  it('actions', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(v.string(), setComponent('test2'), getField(fields$));

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            actions: [
              setComponent(Test1Component),
              actions.props.patch({
                value: 1,
              }),
            ],
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    expect(field.props()).toEqual({ value: 1 });
  });
});
