import { Component, input } from '@angular/core';

@Component({
  selector: 'demo-log',
  standalone: true,
  template: `
    @if (logs().length) {
      <div class="rounded-box bg-base-200 p-3 text-sm">
        <div class="mb-1 font-semibold">事件日志</div>
        @for (item of logs(); track $index) {
          <div>{{ item }}</div>
        }
      </div>
    }
  `,
})
export class LogNFCC {
  logs = input<string[]>([]);
}
