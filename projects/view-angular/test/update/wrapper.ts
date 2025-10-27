import { Component, forwardRef, input, OnInit } from '@angular/core';
import { BaseControl } from '../../lib/component/form/control.base.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PiyingViewWrapperBase } from '@piying/view-angular';

@Component({
  selector: 'app-wrapper',
  template: '<ng-container #fieldComponent></ng-container>',
  providers: [],
})
export class UpdateW extends PiyingViewWrapperBase {}
