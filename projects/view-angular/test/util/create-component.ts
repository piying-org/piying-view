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
  getLazyImport,
  isLazyMark,
  lazyMark,
} from '@piying/view-angular-core';
import { SchemaOrPipe } from '@piying/valibot-visit';
import { PiyingViewGroup } from '@piying/view-angular';
import { isComponentType } from '../../lib/util/async-cache';

export async function createSchemaComponent(
  field: WritableSignal<SchemaOrPipe>,
  model: WritableSignal<any>,
  defaultConfig?: PiViewConfig,
  context?: any,
) {
  // 预加载
  let types = [
    ...Object.values(defaultConfig?.types ?? {}).map((item) => {
      return item.type;
    }),
    ...Object.values(defaultConfig?.wrappers ?? {}).map((item) => {
      return item.type;
    }),
  ].filter((item) => {
    return (
      !isComponentType(item) && (typeof item === 'function' || isLazyMark(item))
    );
  });

  if (types.length) {
    await Promise.all(
      types.map((item) => {
        return getLazyImport<() => Promise<any>>(item)!();
      }),
    );
  }
  @Component({
    template: `<piying-view
      [schema]="fields$()"
      [(model)]="model$"
      (modelChange)="mdChange()"
      [options]="options"
    ></piying-view>`,
    standalone: true,
    imports: [PiyingView],
  })
  class Hello {
    fieldConfig = {
      ...defaultConfig,
      types: {
        test1: {
          type: Test1Component,
        },
        object: {
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
  };
}
