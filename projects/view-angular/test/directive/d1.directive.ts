import { Directive, input } from '@angular/core';

@Directive({
  selector: '[d1]',
  host: {
    class: 'd1',
    '[id]': 'id()',
  },
  standalone: true,
})
export class D1Directive {
  id = input<string>();
}
