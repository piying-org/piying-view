import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';
import { getDeepError } from '@piying/view-angular-core';
import JSONFormatter from 'json-formatter-js';

@Component({
  selector: '',
  templateUrl: './component.html',
})
export default class FormHelperComponent {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  anchor = viewChild<ElementRef<HTMLElement>>('anchor');
  field = inject(PI_VIEW_FIELD_TOKEN);
  value = computed(() => this.field().form.root.value$$());
  forceEnableSubmit = input(false);
  constructor() {
    effect(() => {
      const anchor = this.anchor()?.nativeElement;
      if (!anchor) {
        return;
      }
      anchor.innerHTML = '';
      const data = this.field().form.root.value$$();
      if (!data) {
        return;
      }
      const formatter = new JSONFormatter(data);
      anchor.appendChild(formatter.render());
    });
  }

  submit() {
    this.field().form.root.emitSubmit();
    if (this.field().form.root.valid) {
      alert(JSON.stringify(this.field().form.root.value));
    }
  }
  resetForm() {
    this.field().form.root.reset(this.lastData);
  }
  lastData: any;
  saveInit() {
    this.lastData = this.field().form.root.value;
  }
  errorStr$$ = computed(() => {
    const field = this.field();
    const valibot = getDeepError(field.form.control);
    return valibot.map((item) => item.valibotIssueSummary).join('\n');
  });
}
