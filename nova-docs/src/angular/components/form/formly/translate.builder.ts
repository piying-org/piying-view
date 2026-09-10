import { computed, Injectable, isSignal } from '@angular/core';
import {
  AngularFormBuilder,
  type PiResolvedViewFieldConfig,
  NgSchemaHandle,
} from '@piying/view-angular';
import { deepEqual } from 'fast-equals';
function getSignalValue(inputs: any) {
  return isSignal(inputs) ? inputs() : inputs;
}
@Injectable()
export class TranslateNgBuilder extends AngularFormBuilder {
  override afterResolveConfig(
    rawConfig: NgSchemaHandle,
    config: PiResolvedViewFieldConfig,
  ) {
    const parsed = super.afterResolveConfig(rawConfig, config);
    const props = parsed.props;

    const propsData = props();
    config.context?.['lang']?.subscribe?.((lang: any) => {
      const i18n = config.context?.['i18n'];
      if (!lang || !i18n) {
        return;
      }
      const title = i18n[lang]?.[propsData['title']];
      if (!title) {
        return;
      }
      config.props.update((value) => ({ ...value, title }));
    });
    return parsed;
  }
}
