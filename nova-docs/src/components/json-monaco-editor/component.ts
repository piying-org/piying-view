import {
  Component,
  ElementRef,
  effect,
  forwardRef,
  inject,
  type OnDestroy,
} from '@angular/core';
import { BaseControl } from '../form/base.component.js';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AmdInit$$ } from '../monaco-editor/init.js';
import { ThemeService } from '../../services/theme.service.js';
@Component({
  selector: 'div[type=json-editor]',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonEditorComponent),
      multi: true,
    },
  ],
})
export default class JsonEditorComponent
  extends BaseControl
  implements OnDestroy
{
  #eleRef = inject<ElementRef<HTMLElement>>(ElementRef);
  #theme = inject(ThemeService);
  instance;
  constructor() {
    super();
    this.instance = this.amdInit()?.then(() => this.init());
    effect(() => {
      const theme = this.#theme.monacoTheme();
      this.instance?.then((editor) => editor.updateOptions({ theme }));
    });
  }

  ngOnDestroy(): void {
    this.instance?.then((instance) => instance.dispose());
  }

  override writeValue(obj: any): void {
    super.writeValue(obj);
    this.instance?.then((instance) => {
      instance.setValue(obj ?? '');
    });
  }
  async amdInit() {
    if (document) {
      return AmdInit$$();
    }
    return;
  }
  async init() {
    const instance = monaco.editor.create(this.#eleRef.nativeElement, {
      value: ``,
      language: 'json',
      minimap: { enabled: false },
      theme: this.#theme.monacoTheme(),
    });
    instance.onDidChangeModelContent(() => {
      this.valueChange(instance.getValue());
    });
    return instance;
  }
}
