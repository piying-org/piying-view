import { effect, type EffectRef } from 'static-injector';
import { InjectorToken } from '../token';
const destroyKey = '##effectRefDestroy';
type AddRecord<Current, Key extends PropertyKey, Value> = {
  [K in keyof Current | Key]: K extends keyof Current ? Current[K] : Value;
};
export class SignalToDataFactory<ExtraData extends Record<string, any> = {}> {
  private keyObject: ExtraData = {} as ExtraData;
  private listenList: ((that: any) => EffectRef)[] = [];

  toData<K extends PropertyKey, T>(
    key: K,
    value: (that: any) => T | undefined,
  ): SignalToDataFactory<AddRecord<ExtraData, K, T>> {
    (this.keyObject as AddRecord<ExtraData, K, T>)[key] = undefined as any;
    this.listenList.push((that: Record<K, any>) => {
      that[key] = value(that);
      return effect(
        () => {
          const currentValue = value(that);
          if (!Object.is(that[key], currentValue)) {
            that[key] = currentValue;
          }
        },
        { injector: (that as any)[InjectorToken] },
      );
    });
    return this as any;
  }

  getData() {
    return this.keyObject;
  }

  create(that: any): void {
    const refList = this.listenList.map((fn) => fn(that));
    that[destroyKey] = () => {
      refList.forEach((ref) => {
        ref.destroy();
      });
    };
  }

  destroy(that: any): void {
    if (that[destroyKey] && typeof that[destroyKey] === 'function') {
      that[destroyKey]();
    }
  }
}
