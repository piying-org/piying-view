import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { ContentButtonComponent } from './content-button/component';
import * as v from 'valibot';
import { contentsConfig } from './util/action';
import { setComponent } from '@piying/view-angular-core';

describe('内容投影', () => {
  it('投影', async () => {
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('content'),
        contentsConfig([
          { select: '.content1', nodes: [document.createTextNode('内容1')] },
          { select: '.content2', nodes: [document.createTextNode('内容2')] },
        ]),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),

      {
        types: {
          content: {
            type: ContentButtonComponent,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let result = element.querySelector('.div-content1');
    expect(result?.textContent).toBe('内容1');
    result = element.querySelector('.div-content2');
    expect(result?.textContent).toBe('内容2');
  });
  it('部分投影', async () => {
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('content'),
        contentsConfig([
          { select: '.content2', nodes: [document.createTextNode('内容2')] },
        ]),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),

      {
        types: {
          content: {
            type: ContentButtonComponent,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let result = element.querySelector('.div-content1');
    expect(result?.textContent).not.toBe('内容1');
    result = element.querySelector('.div-content2');
    expect(result?.textContent).toBe('内容2');
  });
  it('不投影', async () => {
    const define = v.object({
      v1: v.pipe(v.string(), setComponent('content')),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),

      {
        types: {
          content: {
            type: ContentButtonComponent,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let result = element.querySelector('.div-content1');
    expect(result?.textContent).not.toBe('内容1');
    result = element.querySelector('.div-content2');
    expect(result?.textContent).not.toBe('内容2');
  });
  it('原生投影', async () => {
    const content1$ = signal('内容1');
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('content'),
        contentsConfig([
          { select: '.content1', text: content1$ },
          { select: '.content2', text: signal('内容2') },
        ]),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),

      {
        types: {
          content: {
            type: ContentButtonComponent,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let result = element.querySelector('.div-content1');
    expect(result?.textContent).toBe('内容1');
    result = element.querySelector('.div-content2');
    expect(result?.textContent).toBe('内容2');
    content1$.set('修改内容1');
    await fixture.whenStable();
    fixture.detectChanges();
    result = element.querySelector('.div-content1');
    expect(result?.textContent).toBe('修改内容1');
  });
});
