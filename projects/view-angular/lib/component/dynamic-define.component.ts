import {
  ɵɵdefineComponent,
  ɵɵelementStart,
  ɵɵtwoWayBindingSet,
  ɵɵelementEnd,
  ɵɵtwoWayProperty,
  Type,
  Signal,
  ɵɵproperty,
  ɵɵlistener,
  WritableSignal,
  viewChild,
  TemplateRef,
  ɵRenderFlags,
  ɵɵtemplate,
  ɵɵviewQuerySignal,
  ɵɵqueryAdvance,
  reflectComponentType,
  ElementRef,
  ɵɵprojectionDef,
  ɵɵprojection,
  ɵɵtext,
  ɵɵtextInterpolate,
} from '@angular/core';
import { ComponentContent } from '../type/component';
import { parseSelectorToR3Selector } from '../hook/selector';
import {
  CoreRawViewAttributes,
  CoreRawViewOutputs,
} from '@piying/view-angular-core';

export type DirectiveConfig<T = any> = {
  /** string表示是标签,type<any>是组件或者指令 */
  type: Type<T> | string;
  inputs?: Signal<Record<string, any>>;
  outputs?: CoreRawViewOutputs;
  model?: Record<string, WritableSignal<any>>;
  selector?: string;
  attributes?: Signal<CoreRawViewAttributes | undefined>;
  contents?: ComponentContent;
};
type InputDirectives = DirectiveConfig[];
function parseDirectives(
  component: InputDirectives[number],
  list: InputDirectives,
) {
  let vars = 0;
  const consts: (string | number)[] = [];
  const directiveList: Type<any>[] = [];
  const propertyList: { signal: Signal<any>; keyList: string[] }[] = [];
  const listenerList = [];
  const modelList = [];
  let elementTag: string;
  if (typeof component.type === 'string') {
    elementTag = component.type;
  } else {
    const componentDefine = reflectComponentType(component.type);
    elementTag = component.selector ?? componentDefine!.selector;
    directiveList.push(component.type);
  }
  if (!elementTag) {
    throw new Error('未找到元素对应的选择器');
  }
  // todo 静态attr应该改为动态的
  const attributes = component.attributes?.();
  if (attributes) {
    for (const key in attributes) {
      consts.push(key, attributes[key]);
    }
  }
  const mergedList = [component, ...list];
  for (let i = 0; i < mergedList.length; i++) {
    const item = mergedList[i];
    if (i > 0) {
      directiveList.push(item.type as Type<any>);
      const define = (item.type as any)['ɵdir'];
      const selectors = define.selectors as string[][];
      const selector =
        item.selector ??
        selectors.find(
          (selectorList) =>
            selectorList.length === 3 &&
            selectorList[0] === '' &&
            selectorList[2] === '',
        )![1];
      if (
        ((item.inputs && !(selector in item.inputs())) || !item.inputs) &&
        ((item.model && !(selector in item.model)) || !item.model)
      ) {
        consts.push(selector, '');
      }
    }
    if (item.inputs) {
      propertyList[i] = { signal: item.inputs, keyList: [] };
      for (const key in item.inputs()) {
        vars++;
        propertyList[i].keyList.push(key);
      }
    }
    for (const key in item.outputs) {
      listenerList.push({
        eventName: key,
        listenerFn: item.outputs[key],
      });
    }
    for (const key in item.model) {
      vars++;
      modelList.push({
        key: key,
        eventName: `${key}Change`,
        signal: item.model[key],
      });
    }
  }
  // packages/core/src/render3/interfaces/attribute_marker.ts
  consts.push(3);
  consts.push(
    ...new Set([
      ...listenerList.map(({ eventName }) => eventName),
      ...modelList.map(({ eventName }) => eventName),
    ]),
  );
  consts.push(
    ...new Set([
      ...propertyList.flatMap((item) => item.keyList),
      ...modelList.map(({ key }) => key),
    ]),
  );
  return {
    vars,
    consts: [['el', ''], consts],
    directiveList,
    propertyList: propertyList,
    listenerList: listenerList,
    modelList,
    elementTag,
  };
}
/** 常量不变 */
const EL_QUERY = ['el'] as ['el'];
let index = 0;
export function createDynamicComponentDefine<T extends DirectiveConfig>(
  component: T,
  directives: InputDirectives,
) {
  const result = parseDirectives(component, directives);
  let contentArray: '*'[] | undefined;
  let contentData;
  if (component.contents?.length) {
    contentArray = new Array(component.contents!.length).fill('*');
    contentData;
  }
  function templateFn(rf: ɵRenderFlags, ctx: any) {
    if (rf & 1) {
      ɵɵelementStart(0, result.elementTag, 1, 0);
      result.listenerList.reduce(
        (fn, item) => fn(item.eventName, item.listenerFn),
        ɵɵlistener,
      );
      result.modelList.reduce(
        (fn, item) =>
          fn(item.eventName, (value) => {
            ɵɵtwoWayBindingSet(item.signal, value);
          })!,
        ɵɵlistener,
      );
      if (component.contents?.length) {
        component.contents.forEach((item, index) => {
          if (item.select) {
            ɵɵprojection(
              index + 2,
              index,
              [
                'ngProjectAs',
                item.select,
                5,
                parseSelectorToR3Selector(item.select)[0] as any,
              ],
              item.text
                ? (rf, ctx) => {
                    if (rf & 1) {
                      ɵɵtext(0);
                    }
                    if (rf & 2) {
                      ɵɵtextInterpolate(item.text!());
                    }
                  }
                : undefined,
              item.text ? 1 : undefined,
              item.text ? 1 : undefined,
            );
          } else {
            ɵɵprojection(index + 1, index);
          }
        });
      }
      ɵɵelementEnd();
    }
    if (rf & 2) {
      result.propertyList.reduce((fn, { signal, keyList }) => {
        const value = signal();
        return keyList.reduce((fn, key) => fn(key, value[key]), fn);
      }, ɵɵproperty);
      result.modelList.reduce(
        (fn, item) => fn(item.key, item.signal)!,
        ɵɵtwoWayProperty,
      );
    }
  }
  return class D {
    templateRef = viewChild.required(TemplateRef) as any as Signal<
      TemplateRef<any>
    >;
    componentInstance = viewChild('el') as any as Signal<
      | (T['type'] extends string ? ElementRef<HTMLElement> : T['type'])
      | undefined
    >;
    elementRef = viewChild('el', { read: ElementRef }) as any as Signal<
      ElementRef<HTMLElement> | undefined
    >;
    directiveRefList = directives.map(
      ({ type }) =>
        viewChild('el', { read: type as any }) as any as Signal<any>,
    );
    static ɵfac = (_: any) => new (_ || D)();
    static ɵcmp = ɵɵdefineComponent({
      type: D,
      selectors: [[`d-${index++}`]],
      ngContentSelectors: contentArray,
      decls: 1,
      vars: 0,
      consts: result.consts,
      template: (rf, ctx) => {
        if (rf & 1) {
          if (contentArray) {
            ɵɵprojectionDef(contentArray);
          }
          ɵɵtemplate(
            0,
            templateFn,
            2 + (component.contents?.length ?? 0),
            result.vars,
            'ng-template',
          );
        }
      },
      viewQuery: (rf, ctx) => {
        if (rf & 1) {
          ɵɵviewQuerySignal(ctx.templateRef, TemplateRef, 5 as any);
          ɵɵviewQuerySignal(ctx.componentInstance, EL_QUERY, 5 as any);
          ɵɵviewQuerySignal(ctx.elementRef, EL_QUERY, 5 as any, ElementRef);
          directives.forEach(({ type }, index) => {
            ɵɵviewQuerySignal(
              ctx.directiveRefList[index],
              EL_QUERY,
              5 as any,
              type as any,
            );
          });
        }
        if (rf & 2) {
          ɵɵqueryAdvance(3 + directives.length);
        }
      },
      dependencies: result.directiveList,
      encapsulation: 2,
      changeDetection: 0,
    });
  };
}
