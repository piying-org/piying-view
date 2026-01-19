import { inject, Injectable } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';

@Injectable()
export class Nest1Service {
  field = inject(PI_VIEW_FIELD_TOKEN);
}
