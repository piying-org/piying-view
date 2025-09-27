import { Component } from '@angular/core';
import { DefaultValueAccessor } from '../default_value_accessor';

@Component({
  selector: 'input',
  template: '',
  standalone: true,
  hostDirectives: [DefaultValueAccessor],
})
export class InputFCC {
  readonly __isElement = true;
}
