import {
  ChangeDetectionStrategy,
  Component,
  computed,
  createEnvironmentInjector,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  TemplateRef,
  untracked,
} from '@angular/core';
import { NgComponentOutlet } from './hook/ng_component_outlet';

import {
  PiViewConfig,
  PiResolvedViewFieldConfig,
  NgResolvedWraaperConfig,
} from './type';

import { NgTemplateOutlet } from '@angular/common';
import { NgResolvedComponentDefine2 } from './type/component';
import { createAsyncCache } from './util/async-cache';
import {
  convert,
  FieldArray,
  FieldControl,
  FieldGroup,
  initListen,
  isFieldArray,
} from '@piying/view-angular-core';
import { AngularFormBuilder } from './builder';
import { NgSchemaHandle } from './schema/ng-schema';
import { NgConvertOptions } from './type/builder-type';
import type { SetOptional } from '@piying/view-angular-core';
import * as v from 'valibot';
import { PurePipe } from './pipe/pure.pipe';
const DefaultConvertOptions = {
  builder: AngularFormBuilder,
  handle: NgSchemaHandle as any,
};
@Component({
  selector: 'piying-view',
  imports: [NgComponentOutlet, PurePipe, NgTemplateOutlet],
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiyingView implements OnChanges {
  schema = input.required<
    v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>
  >();
  model = input<any>(undefined);
  modelChange = output<any>();
  options = input<
    Omit<
      SetOptional<NgConvertOptions, 'builder' | 'handle'>,
      'fieldGlobalConfig'
    > & { fieldGlobalConfig?: PiViewConfig }
  >();
  form$$ = computed(
    () =>
      this.resolvedField$()?.form.control as
        | (FieldControl | FieldGroup | FieldArray)
        | undefined,
  );

  #lastRF?: PiResolvedViewFieldConfig;
  ngOnChanges(changes: SimpleChanges): void {
    const rFields = this.#resolvedFields$$();
    if (this.#lastRF !== rFields || 'model' in changes) {
      this.#updateValue(this.model());
    }
    this.#lastRF = rFields;
  }

  #resolvedFields$$ = computed(() => {
    this.schema();
    return untracked(() => this.#updateField());
  });

  #injector = inject(Injector);
  #envInjector = inject(EnvironmentInjector);
  #builderEnvInjector?: EnvironmentInjector;
  resolvedField$ = signal<PiResolvedViewFieldConfig | undefined>(undefined);
  #listenDispose?: () => void;

  #updateField() {
    this.#clean();
    // 临时销毁
    const envInjector = createEnvironmentInjector([], this.#envInjector);
    this.#builderEnvInjector = envInjector;
    const result = convert<PiResolvedViewFieldConfig>(this.schema() as any, {
      ...DefaultConvertOptions,
      ...this.options(),
      injector: envInjector,
      registerOnDestroy: (fn) => {
        envInjector.get(DestroyRef).onDestroy(() => {
          fn();
        });
      },
    });
    this.resolvedField$.set(result);
    return result;
  }
  #clean() {
    if (this.#builderEnvInjector) {
      this.#builderEnvInjector.destroy();
      this.#builderEnvInjector = undefined;
    }
  }

  #updateValue(model: Record<string, any> | undefined) {
    this.#listenDispose?.();
    const result = this.resolvedField$()!;
    if (result.form.control) {
      // 监听初始化,每次field变更会初始化
      const ref = initListen(
        this.model(),
        result!.form.control,
        // 使用envInjector会导致在测试中慢一次检查,生产上可能也会慢一点?
        this.#injector,
        (value) => {
          untracked(() => {
            if (result!.form.control?.valueNoError$$()) {
              this.modelChange.emit(value);
            }
          });
        },
      );
      this.#listenDispose = () => {
        ref.destroy();
        this.#listenDispose = undefined;
      };
      result.form.control.updateValue(model);
    }
  }

  groupInputsValue = (
    inputs: PiResolvedViewFieldConfig['inputs'],

    fieldTemplateRef: TemplateRef<any>,
  ) =>
    computed(() => ({
      ...inputs(),
      fieldTemplateRef,
    }));

  resolvedComponent = createAsyncCache<true, NgResolvedComponentDefine2>(
    true,
    this.#injector,
  );
  // 这里的组件还是不准确,因为type已经改了,
  resolvedWrapper = createAsyncCache<false, NgResolvedWraaperConfig[]>(
    false,
    this.#injector,
  );

  ngOnDestroy(): void {
    this.#listenDispose?.();
  }
}
