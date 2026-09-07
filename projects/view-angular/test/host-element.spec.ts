import { signal } from '@angular/core';
import { Test1Component } from './test1/test1.component';
import { Wrapper1Component } from './wrapper1/component';
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';
import { createSchemaComponent } from './util/create-component';

describe('hostElement', () => {
  it('组件渲染到传入的hostElement中,而不是默认view容器', async () => {
    const hostElement = document.createElement('div');
    hostElement.id = 'test-host';
    document.body.appendChild(hostElement);

    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent(Test1Component),
        actions.createOptions.set({ hostElement }),
      ),
    });
    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const renderedHost = document.getElementById('test-host')!;
    expect(renderedHost.querySelector('.test1-div-input1')).toBeTruthy();
    expect(element.querySelector('.test1-div-input1')).toBeFalsy();

    document.body.removeChild(hostElement);
  });

  it('未传入hostElement时,组件仍渲染到默认view容器', async () => {
    const define = v.object({
      key1: v.pipe(v.string(), setComponent(Test1Component)),
    });
    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    // 未设置 hostElement,组件应该渲染在默认 view 容器中
    expect(element.querySelector('.test1-div-input1')).toBeTruthy();
  });

  it('hostElement未连接(isConnected=false)时', async () => {
    const hostElement = document.createElement('div');
    hostElement.id = 'test-host';

    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent(Test1Component),
        actions.createOptions.set({ hostElement }),
      ),
    });
    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const renderedHost = document.getElementById('test-host')!;
    expect(renderedHost.querySelector('.test1-div-input1')).toBeTruthy();
  });

  it('有wrappers时,hostElement作用于第一层(第一个wrapper)', async () => {
    const hostElement = document.createElement('div');
    hostElement.id = 'test-host-wrapper';
    document.body.appendChild(hostElement);

    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.wrappers.set(['wrapper1', 'wrapper2']),
        actions.inputs.set({
          input1: 'div-display',
        }),
        actions.createOptions.set({ hostElement }),
      ),
    });
    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),
      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const renderedHost = document.getElementById('test-host-wrapper')!;
    // 第一层 wrapper1 应该在 hostElement 中
    expect(renderedHost.querySelector('.wrapper1-div-label')).toBeTruthy();
    // 内层组件(嵌套在 wrapper 中)也应该在 hostElement 中
    expect(renderedHost.querySelector('.test1-div-input1')).toBeTruthy();
    // 默认 view 容器中不应该出现 wrapper1
    expect(element.querySelector('.wrapper1-div-label')).toBeFalsy();

    document.body.removeChild(hostElement);
  });
});
