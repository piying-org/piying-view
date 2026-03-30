import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { rawConfig } from './raw-config';
import { mergeHooksFn } from './hook';
import { AsyncObjectSignal } from '../../util/create-async-object-signal';

function findTopmostField(field: _PiResolvedCommonViewFieldConfig) {
  const wrappers = field.wrappers();
  if (wrappers?.length) {
    return wrappers[0];
  }
  return field;
}

type PositionKey = 'attributes' | 'events';

function createTopSetter<T>(
  key: PositionKey,
  setter: (signal: AsyncObjectSignal<any>) => void,
) {
  return rawConfig<T>((rawField) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const topField = findTopmostField(field);
          const signal = topField[key];
          setter(signal);
        },
      },
      { position: 'bottom' },
      rawField,
    );
  });
}

// function createTopAsyncSetter<T>(
//   key: PositionKey,
//   getValueFn: (field: _PiResolvedCommonViewFieldConfig) => any,
// ) {
//   return rawConfig<T>((rawField) => {
//     mergeHooksFn(
//       {
//         allFieldsResolved: (field) => {
//           const topField = findTopmostField(field);
//           const signal = topField[key];
//           const value = getValueFn(field);
//           signal.connect(key, value);
//         },
//       },
//       { position: 'bottom' },
//       rawField,
//     );
//   });
// }

function topSet(key: PositionKey, isPatch?: boolean) {
  return <T>(value: any) =>
    createTopSetter<T>(key, (signal) => {
      if (isPatch) {
        signal.update((current) => ({ ...current, ...value }));
      } else {
        signal.set(value);
      }
    });
}

// function topAsync<T>(key: PositionKey, getValueFn: AsyncCallback<any>) {
//   return createTopAsyncSetter<T>(key, (field) => getValueFn(field));
// }

export const top = {
  setOrPath: topSet,
//   async: topAsync,
};
