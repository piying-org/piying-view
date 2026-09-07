import { signal } from '@angular/core';
import * as v from 'valibot';
import { By } from '@angular/platform-browser';
import { createSchemaComponent } from './util/create-component';
import { setComponent, actions } from '@piying/view-angular-core';
import { directives } from '../lib/schema/action/directive';
import { D2Directive } from './directive/d2.directive';
import { Test1Component } from './test1/test1.component';
import { PI_COMPONENT_REF_TOKEN } from '../lib/type';
import { Wrapper1Component } from './wrapper1/component';

describe('新指令', () => {
  function getComponentRef(element: HTMLElement, fixture: any) {
    const directive = fixture.debugElement
      .query(By.directive(D2Directive))
      .injector.get(D2Directive);
    return (directive as D2Directive).injector.get(PI_COMPONENT_REF_TOKEN);
  }

  it('无 wrapper: 指令可解析 PI_COMPONENT_REF_TOKEN', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      directives.patch([{ type: D2Directive }]),
    );
    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.d2')).toBeTruthy();

    const componentRef = getComponentRef(element, fixture);
    expect(componentRef).toBeTruthy();
    expect(componentRef.instance).toBeInstanceOf(Test1Component);
  });

  it('带 wrapper: 指令仍可解析 PI_COMPONENT_REF_TOKEN', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      actions.wrappers.set(['wrapper1']),
      directives.patch([{ type: D2Directive }]),
    );
    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
      {
        wrappers: {
          wrapper1: { type: Wrapper1Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('app-wrapper1')).toBeTruthy();
    expect(element.querySelector('.d2')).toBeTruthy();

    const componentRef = getComponentRef(element, fixture);
    expect(componentRef).toBeTruthy();
    expect(componentRef.instance).toBeInstanceOf(Test1Component);
  });
});
