import {
  ValidationCommonError2,
  ValidationErrorError2,
  ValidationErrors2,
  ValidationValibotError2,
} from '../../field/abstract_model';

export function findError<K extends string>(
  list: ValidationErrors2[] | undefined,
  key: K,
):
  | (K extends ValidationValibotError2['kind']
      ? ValidationValibotError2
      : K extends ValidationErrorError2['kind']
        ? ValidationErrorError2
        : ValidationCommonError2)
  | undefined {
  if (!list) {
    return undefined;
  }

  return list.find((item) => item.kind === key) as any;
}
