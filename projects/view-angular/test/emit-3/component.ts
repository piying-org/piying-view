import { ChangeDetectionStrategy, Component, output } from '@angular/core';

/** 事件名与 Emit1/Emit2 完全互斥, 用于验证「事件确实来自指定字段」 */
@Component({
  selector: 'test-emit3',
  templateUrl: './component.html',
  standalone: true,
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Emit3Component {
  onlyEmit3 = output<string>();
  otherEmit3 = output<string>();
  emit3Only() {
    this.onlyEmit3.emit('emit3-only-data');
  }
  emit3Other() {
    this.otherEmit3.emit('emit3-other-data');
  }
}
