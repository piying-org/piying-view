import * as v from 'valibot';
import { AbstractControl, ValidationErrors } from '../field/abstract_model';

export function customValibotValidator2(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
) {
  const parser = v.safeParser(schema);
  return (control: AbstractControl): ValidationErrors | undefined => {
    const result = parser(control.value);
    if (result.issues) {
      return {
        valibot: result.issues,
      };
    }
    return undefined;
  };
}
