import { Component, computed, model, signal, viewChild } from '@angular/core';
import { Test1Component } from './test1/test1.component';

import * as v from 'valibot';
import {
  FieldArray,
  FieldControl,
  FieldGroup,
} from '@piying/view-angular-core';

import { typedComponent } from '../lib/util/typed-component';
import { PiyingView } from '../lib/view.component';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { PiyingViewGroup } from '../lib/component/group/component';

describe('强类型化', () => {
  it('存在', async () => {
    let typeDefine = typedComponent({
      types: {
        test1: { type: Test1Component },
        object: { type: PiyingViewGroup },
      },
    });
    const define = v.object({
      key1: v.pipe(
        v.string(),
        typeDefine.setComponent('test1', (actions) => {
          actions.outputs.patch({ output1: () => {} });
          actions.outputs.set({ output1: () => {} });
          actions.outputs.mapAsync((field) => {
            return (value) => {
              return value;
            };
          });
          actions.outputs.patchAsync({
            output1: (field) => {
              return (input) => {};
            },
          });
          actions.inputs.patch({ input1: '' });
          return [actions.inputs.set({ input1: 'div-display' })];
        }),
        v.transform((a) => {
          let str: string = a;
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
    let element = fixture.nativeElement;
    expect(element).toBeTruthy();
    fixture.detectChanges();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
});
