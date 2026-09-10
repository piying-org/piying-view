import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { PiyingView } from '@piying/view-angular';
import { FieldGlobalConfig } from '../define';
import { CustomNgBuilder } from '../form/custom.builder';
import { JsonSchemaHandle } from '../form/formly/json.handle';
import { BaseControl } from '../form/base.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import * as v from 'valibot';
import { actions } from '@piying/view-angular-core';
@Component({
  selector: 'app-json-schema-view',
  templateUrl: './component.html',
  standalone: true,
  imports: [PiyingView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonSchemaViewRC),
      multi: true,
    },
  ],
})
export default class JsonSchemaViewRC extends BaseControl {
  data = input<Record<string, any>>();

  schema$$ = computed(() =>
    jsonSchemaToValibot(this.data()!['schema'], {
      schemaHandle: {
        afterResolve(vSchema, jSchema) {
          return vSchema;
        },
        type: {
          afterResolve: (vSchema, jSchema, type) => {
            let result = vSchema;
            if (type === 'boolean') {
              result = v.pipe(
                result,
                actions.props.patch({ labelPosition: 'right' }),
              );
            }
            if (type !== 'object') {
              result = v.pipe(
                result,
                actions.wrappers.set([
                  'tooltip',
                  'jsonschema-label',
                  'validator',
                ]),
              );
            }
            return result;
          },
        },
      },
      customActions: {
        testTitle: () => v.title('isTestTitle'),
      },
    }),
  );

  model$$ = computed(() => this.data()!['model']);
  options = {
    fieldGlobalConfig: FieldGlobalConfig,
    builder: CustomNgBuilder as any,
    handle: JsonSchemaHandle as any,
  };
}
