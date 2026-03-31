import { Component, computed, model, signal, viewChild } from '@angular/core';
import { Test1Component } from './test1/test1.component';

import * as v from 'valibot';
import {
  actions,
  FieldArray,
  FieldControl,
  FieldGroup,
  setComponent,
} from '@piying/view-angular-core';

import { typedComponent } from '../lib/util/typed-component';
import { PiyingView } from '../lib/view.component';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { PiyingViewGroup } from '../lib/component/group/component';
import { createSchemaComponent } from './util/create-component';

describe('强类型化', () => {
  it('存在', async () => {
    const typeDefine = typedComponent({
      types: {
        test1: {
          type: Test1Component,
        },
        test2: {
          actions: [setComponent(Test1Component)],
        },
        object: { type: PiyingViewGroup },
      },
    });

    typeDefine.setComponent('test2', (actions) => {
      actions.outputs.patch({ output1: () => {} });
      actions.outputs.set({
        output1: (input) => {
          const str: string = input;
        },
      });
      actions.outputs.mapAsync((field) => (value) => value);
      actions.outputs.patchAsync({
        output1: (field) => (input) => {},
      });
      actions.inputs.patch({ input1: '' });
      return [actions.inputs.set({ input1: 'div-display' })];
    });
    typeDefine.setComponent(Test1Component, (actions) => {
      actions.outputs.patch({ output1: () => {} });
      actions.outputs.set({
        output1: (input) => {
          const str: string = input;
        },
      });
      actions.outputs.mapAsync((field) => (value) => value);
      actions.outputs.patchAsync({
        output1: (field) => (input) => {},
      });
      actions.inputs.patch({ input1: '' });
      return [actions.inputs.set({ input1: 'div-display' })];
    });
    const define = v.object({
      key1: v.pipe(
        v.string(),
        typeDefine.setComponent('test1', (actions) => {
          actions.outputs.patch({ output1: () => {} });
          actions.outputs.set({
            output1: (input) => {
              const str: string = input;
            },
          });
          actions.outputs.mapAsync((field) => (value) => value);
          actions.outputs.patchAsync({
            output1: (field) => (input) => {},
          });
          actions.inputs.patch({ input1: '' });
          actions.inputs.patch({ transformed: 1 });
          return [actions.inputs.set({ input1: 'div-display' })];
        }),
        v.transform((a) => {
          const str: string = a;
          return str;
        }),
      ),
    });
    @Component({
      template: `<piying-view
        [schema]="schema"
        [(model)]="model$"
        (modelChange)="mdChange()"
        [options]="options"
        #view
      ></piying-view>`,
      standalone: true,
      imports: [PiyingView],
    })
    class Hello {
      view = viewChild.required('view', { read: PiyingView });
      field$$ = computed(() => this.view().resolvedField$());
      fieldConfig = typeDefine.define;
      component = viewChild(PiyingView);
      form$ = computed(
        () =>
          this.component()?.form$$() as FieldGroup | FieldArray | FieldControl,
      );
      schema = define;
      model$ = model;
      context = {};
      options = {
        context: this.context,
        fieldGlobalConfig: this.fieldConfig,
      };
      changeIndex$ = signal(0);
      resolvedField$ = computed(() => this.component()?.resolvedField$());
      mdChange() {
        this.changeIndex$.update((index) => index + 1);
      }
    }
    await TestBed.configureTestingModule({
      imports: [Hello],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Hello);
    fixture.detectChanges();
    // const { fixture, instance, element } = await createSchemaComponent(
    //   signal(define),
    //   signal({ key1: 'value1' }),
    // );
    const element = fixture.nativeElement;
    expect(element).toBeTruthy();
    fixture.detectChanges();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });

  it('default actions + typed', async () => {
    const typeDefine = typedComponent({
      types: {
        test1: {
          type: Test1Component,
        },
      },
    });
    const define = v.pipe(v.string(), typeDefine.setComponent('test1'));
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal('d1'),
      {
        types: {
          test1: {
            type: Test1Component,
            actions: [actions.inputs.patch({ input1: 'abc' })],
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field$$()?.inputs()).toEqual({ input1: 'abc' });
  });
});
