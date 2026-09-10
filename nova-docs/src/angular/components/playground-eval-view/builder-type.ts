import { CustomNgBuilder } from '../form/custom.builder';
import { TranslateNgBuilder } from '../form/formly/translate.builder';

export function getBuilderType(input: any) {
  switch (input) {
    case 'translate':
      return TranslateNgBuilder;
    default:
      return CustomNgBuilder;
  }
}
