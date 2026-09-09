import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { debounceTime, filter, map, pipe } from 'rxjs';

export const schema = v.object({
  search: v.pipe(
    v.string(),
    formConfig({
      pipe: {
        toModel: pipe(
          debounceTime(300),
          filter((v) => v.trim().length > 0),
          map((v) => v?.toLowerCase()),
        ),
      },
    }),
  ),

  price: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toView: (value: any) => parseFloat(value),
        toModel: (value: any) => {
          return value?.toFixed(2) ?? '0.00';
        },
      },
    }),
  ),

  birthDate: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toView: (value: any) =>
          value ? new Date(value).toISOString().split('T')[0] : '',
      },
    }),
  ),

  score: v.pipe(
    v.string(),
    v.transform((v) => parseInt(v, 10)),
    v.minValue(0),
    v.maxValue(100),
  ),
});
