import { Component } from '@angular/core';
import { InsertFieldDirective } from '@piying/view-angular';

@Component({
  selector: 'app-wrapper',
  template: '<ng-container insertField></ng-container>',
  providers: [InsertFieldDirective],
  imports: [InsertFieldDirective],
})
export class UpdateW {}
