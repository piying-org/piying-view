import { computed, Injectable, isSignal } from '@angular/core';
import {
  AngularFormBuilder,
  PiResolvedViewFieldConfig,
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

    if (rawConfig.type === 'picklist') {
      const options$$ = computed(() => parsed.props()?.['options'], {
        equal: deepEqual,
      });
      const options = options$$();
      if (options && !parsed.inputs()?.['options']) {
        parsed.inputs.connect('options', options);
      }
    }
    const propsData = props();
    config.context.lang.subscribe((lang: any) => {
      if (!lang) {
        return;
      }
      config.props.update((value) => ({
        ...value,
        title: config.context['i18n'][lang][propsData['title']],
      }));
    });
    return parsed;
  }
}
