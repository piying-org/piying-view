import { Component, input, signal } from '@angular/core';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import {
  ButtonInputFCC,
  InputFCC,
} from '@piying-lib/angular-daisyui/field-control';
import { ButtonNFCC } from '@piying-lib/angular-daisyui/non-field-control';
import { nfcComponent, setComponent } from '@piying/view-angular-core';
@Component({
  selector: 'demo1',
  standalone: true,
  template: ` <piying-view [schema]="schema" [options]="options"></piying-view> `,
  // template:'',
  imports: [PiyingView],
})
export class HelloComponent {
  schema = v.pipe(
    v.object({
      str1: v.pipe(v.string(), setComponent(InputFCC)),
      __btn: v.pipe(nfcComponent(ButtonNFCC)),
    }),
    setComponent(PiyingViewGroup),
  );
  options={

  }
  helpText = input('默认提示');

  show = signal(false);

  toggle() {
    this.show.update((value) => !value);
  }
}
