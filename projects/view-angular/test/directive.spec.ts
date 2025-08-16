import { signal, WritableSignal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { D1Directive } from './directive/d1.directive';
import * as v from 'valibot';
import { getField, hooksConfig } from './util/action';
import { setComponent } from '@piying/view-angular-core';

import {
  patchAsyncDirective,
  patchDirectives,
  setDirectives,
} from '../lib/schema/action/directive';
import { BehaviorSubject } from 'rxjs';
import { TestNgControlDirective } from './directive/test-ng-control.directive';
import { Test1Component } from './test1/test1.component';
import { InteropNgControl } from '../lib/directives/interop_ng_control';
import { Validators } from '@angular/forms';
describe('指令', () => {
  it('自定义指令', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        setDirectives([{ type: D1Directive }]),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.d1')).toBeTruthy();
  });
  it('patchDirectives', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        patchDirectives([{ type: D1Directive }]),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.d1')).toBeTruthy();
  });
  it('async自定义指令', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        patchAsyncDirective((field) => {
          expect(field.renderConfig).toBeTruthy();
          return { type: D1Directive };
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.d1')).toBeTruthy();
  });
  it('async自定义指令-input-promise', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncDirective((field) => ({
        type: D1Directive,
        inputs: { id: Promise.resolve('d1') },
      })),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('#d1')).toBeTruthy();
  });
  it('async自定义指令-input-rxjs', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncDirective((field) => ({
        type: D1Directive,
        inputs: { id: new BehaviorSubject('d1') },
      })),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('#d1')).toBeTruthy();
  });
  it('async自定义指令-input-signal', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncDirective((field) => ({
        type: D1Directive,
        inputs: { id: signal('d1') },
      })),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('#d1')).toBeTruthy();
  });
  it('指令输入', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        setDirectives([{ type: D1Directive, inputs: signal({ id: '' }) }]),
        hooksConfig({
          fieldResolved(field) {
            field$.resolve(field);
            (field.directives!()[0].inputs! as WritableSignal<any>).set({
              id: 'setId',
            });
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('#setId')).toBeTruthy();
  });
  it('test ngControl', async () => {
    const ngControl$ = Promise.withResolvers<InteropNgControl>();

    const define = v.pipe(
      v.string(),
      setComponent(Test1Component),
      setDirectives([
        {
          type: TestNgControlDirective,
          outputs: {
            dataChange: (event: any) => {
              ngControl$.resolve(event);
            },
          },
        },
      ]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const ngControl = await ngControl$.promise;
    expect(ngControl.value).toEqual('d1');
    expect(ngControl.valid).toBeTrue();
    expect(ngControl.invalid).toBeFalse();
    expect(ngControl.pending).toBeFalse();
    expect(ngControl.disabled).toBeFalse();
    expect(ngControl.enabled).toBeTrue();
    expect(ngControl.errors).toEqual(null);
    expect(ngControl.pristine).toBeTrue();
    expect(ngControl.dirty).toBeFalse();
    expect(ngControl.touched).toBeFalse();
    expect(ngControl.untouched).toBeTrue();
    expect(ngControl.statusChanges).toBeTruthy();
    expect(ngControl.hasValidator(Validators.required)).toBeTrue();
    expect(ngControl.hasValidator(1)).toBeFalse();
  });
});
