import { Component } from '@angular/core';
import { PiyingViewWrapperBase } from '@piying/view-angular';

@Component({
  selector: 'app-wrapper',
  template: '<ng-container #fieldComponent></ng-container>',
  providers: [],
})
export class UpdateW extends PiyingViewWrapperBase {}
