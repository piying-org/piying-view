import { Directive, inject, Injector, input } from '@angular/core';

@Directive({
  selector: '[d2]',
  host: {
    class: 'd2',
    '[id]': 'id()',
  },
  standalone: true,
})
export class D2Directive {
  id = input<string>();
  injector = inject(Injector);
}
