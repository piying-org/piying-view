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
import { AmdInit$$ } from './init';
import { ThemeService } from '../../services/theme.service.js';
@Component({
  selector: 'div[type=code-editor]',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditorComponent),
      multi: true,
    },
  ],
})
export default class CodeEditorComponent
  extends BaseControl
  implements OnDestroy
{
  eleRef = inject<ElementRef<HTMLElement>>(ElementRef);
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
  ngOnDestroy(): void {
    this.instance?.then((instance) => instance.dispose());
  }

  async init() {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      skipDefaultLibCheck: true,
      skipLibCheck: true,
    });
    const content = await fetch(`${import.meta.env.BASE_URL}declaration/online-type.d.ts`).then((a) =>
      a.text(),
    );
    const libUri = 'piying.ts';
    monaco.languages.typescript.javascriptDefaults.addExtraLib(content, libUri);
    const instance = monaco.editor.create(this.eleRef.nativeElement, {
      value: ``,
      language: 'javascript',
      minimap: { enabled: false },
      automaticLayout: true,
      theme: this.#theme.monacoTheme(),
    });
    // 临时格式化,应该时等到某个初始化结束再执行,但是没找到
    setTimeout(() => {
      instance.getAction('editor.action.formatDocument')!.run();
    }, 50);
    instance.onDidChangeModelContent(() => {
      this.valueChange(instance.getValue());
    });
    return instance;
  }
}
