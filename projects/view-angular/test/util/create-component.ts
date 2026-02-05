import {
  Component,
  computed,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { PiyingView } from '@piying/view-angular';
import { PiViewConfig } from '@piying/view-angular';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { Test1Component } from '../test1/test1.component';
import {
  FieldArray,
  FieldControl,
  FieldGroup,
} from '@piying/view-angular-core';
import { SchemaOrPipe } from '@piying/valibot-visit';
import { PiyingViewGroup } from '@piying/view-angular';

export async function createSchemaComponent(
  field: WritableSignal<SchemaOrPipe>,
  model: WritableSignal<any>,
  defaultConfig?: PiViewConfig,
  context?: any,
) {
  @Component({
    template: `<piying-view
      [schema]="fields$()"
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
    fieldConfig = {
      ...defaultConfig,
      types: {
        test1: {
          type: Test1Component,
        },
        record: {
          type: PiyingViewGroup,
        },
        object: {
          type: PiyingViewGroup,
        },
        loose_object: {
          type: PiyingViewGroup,
        },
        intersect: {
          type: PiyingViewGroup,
        },
        union: {
          type: PiyingViewGroup,
        },
        array: {
          type: PiyingViewGroup,
        },
        tuple: {
          type: PiyingViewGroup,
        },
        string: {},
        number: {},
        boolean: {},
        void: {},
        'intersect-group': {
          type: PiyingViewGroup,
        },
        ...defaultConfig?.types,
      },
    };
    component = viewChild(PiyingView);
    form$ = computed(
      () =>
        this.component()?.form$$() as FieldGroup | FieldArray | FieldControl,
    );
    fields$ = field;
    model$ = model;
    context = context;
    options = {
      context,
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
  return {
    fixture: fixture,
    instance: fixture.componentInstance,
    element: fixture.nativeElement as HTMLElement,
    field$$: fixture.componentInstance.field$$,
  };
}
