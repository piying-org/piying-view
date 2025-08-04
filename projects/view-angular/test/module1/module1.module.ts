import { NgModule } from '@angular/core';
import { Test2Component } from './test2.component';
import { FormsModule } from '@angular/forms';
import { Test3Component } from './test3.component';

@NgModule({
  declarations: [Test2Component, Test3Component],
  imports: [FormsModule],
  exports: [],
  providers: [],
})
export class Test2Module {}
