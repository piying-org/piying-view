import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiWrapperBaseComponent } from '@piying/view-angular';

@Component({
  selector: 'app-wrapper2',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  imports: [FormsModule],
})
export class Wrapper2Component extends PiWrapperBaseComponent {}
