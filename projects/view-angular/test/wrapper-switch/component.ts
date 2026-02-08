import { Component } from '@angular/core';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';

@Component({
  selector: 'app-wrapper-switch',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [InsertFieldDirective],
})
export class WrapperSwitchComponent {}
