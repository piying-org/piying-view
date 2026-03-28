import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Nest1Service } from '../../nest1.service';

@Component({
  selector: 'app-nest3-wc',
  templateUrl: './component.html',
  standalone: true,
  providers: [Nest1Service],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nest3WC {}
