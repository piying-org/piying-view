import { Component, ElementRef, forwardRef, inject } from '@angular/core';
import { BaseControl } from '../form/base.component.js';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AmdInit$$ } from '../monaco-editor/init.js';
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
export default class JsonEditorComponent extends BaseControl {
  #eleRef = inject<ElementRef<HTMLElement>>(ElementRef);
  instance;
  constructor() {
    super();
    this.instance = this.amdInit()?.then(() => this.init());
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
    });
    instance.onDidChangeModelContent((e) => {
      this.valueChange(instance.getValue());
    });
    return instance;
  }
}
