import { Component, inject, output } from '@angular/core';
import {
  PI_INPUT_MODEL_TOKEN,
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
} from '@piying/view-angular';

@Component({
  template: ``,
})
export class InjectTokenComponent {
  options = inject(PI_INPUT_OPTIONS_TOKEN);
  schema = inject(PI_INPUT_SCHEMA_TOKEN);
  model = inject(PI_INPUT_MODEL_TOKEN);
  output1 = output<any>();

  ngOnInit(): void {
    this.output1.emit({
      options: this.options(),
      schema: this.schema(),
      model: this.model(),
    });
  }
}
