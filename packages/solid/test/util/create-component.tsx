import { type BaseSchema, type SchemaWithPipe } from 'valibot';
import { delay } from './delay';
import { PiyingGroup, PiyingView, type PiViewConfig } from '@piying/view-solid';
import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { BehaviorSubject } from 'rxjs';
import { PiInput } from '../component/input';
import { PiInputNumber } from '../component/input-number';
import { PiInputCheckbox } from '../component/input-checkbox';
import { PiInputRadio } from '../component/input-radio';
import { PiInputRange } from '../component/input-range';
import { PiSelect } from '../component/select';
function TestComp(props: any) {
  const [schema, setSchema] = createSignal(props.schema);
  const [options, setOptions] = createSignal(props.options);
  const [model, setModel] = createSignal(props.model);
  props.registerSchema(setSchema);
  props.registerOptions(setOptions);
  props.registerModel(setModel);
  return (
    <PiyingView
      schema={schema()}
      options={options()}
      model={model()}
      modelChange={props.modelChange}
    ></PiyingView>
  );
}
export async function createComponent(
  schema: BaseSchema<any, any, any> | SchemaWithPipe<any>,
  model: any,
  cmpOptions?: {
    defaultConfig?: PiViewConfig;
    context?: any;
  },
) {
  const options = {
    context: cmpOptions?.context,
    fieldGlobalConfig: {
      ...cmpOptions?.defaultConfig,
      types: {
        string: { type: PiInput },
        number: { type: PiInputNumber },
        range: { type: PiInputRange },
        boolean: { type: PiInputCheckbox },
        picklist: { type: PiSelect },
        radio: { type: PiInputRadio },
        // dynamic: { type: PiInputDynamic },
        object: { type: PiyingGroup },
        array: { type: PiyingGroup },
        ...Object.entries(cmpOptions?.defaultConfig?.types ?? {}).reduce(
          (obj, item) => {
            obj[item[0]] = {
              ...item[1],
              type: item[1].type,
            };
            return obj;
          },
          {} as any,
        ),
      },
      wrappers: {
        // block: {
        //   type: BlockWrapper,
        // },
        ...Object.entries(cmpOptions?.defaultConfig?.wrappers ?? {}).reduce(
          (obj, item) => {
            obj[item[0]] = {
              ...item[1],
              type: item[1].type,
            };
            return obj;
          },
          {} as any,
        ),
      },
    },
  };

  const modelChange$ = new BehaviorSubject(undefined);
  let setSchema: any;
  const registerSchema = (fn: any) => {
    setSchema = fn;
  };
  let setOptions: any;
  const registerOptions = (fn: any) => {
    setOptions = fn;
  };
  let setModel: any;
  const registerModel = (fn: any) => {
    setModel = fn;
  };
  const instance = render(() => (
    <TestComp
      schema={schema}
      options={options}
      model={model}
      modelChange={(value: any) => {
        modelChange$.next(value);
      }}
      registerSchema={registerSchema}
      registerOptions={registerOptions}
      registerModel={registerModel}
    ></TestComp>
  ));
  await delay();

  return {
    instance,
    modelChange$,
    setSchema: (value: any) => setSchema(value),
    setOptions: (value: any) => setOptions(value),
    setModel: (value: any) => setModel(value),
  };
}
