import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingViewWrapperBase } from '@piying/view-angular';
import { InsertFieldDirective } from '../../lib/component/insert-field.directive';

@Component({
  selector: 'app-wrapper4',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [InsertFieldDirective],
})
export class Wrapper4Component {}
