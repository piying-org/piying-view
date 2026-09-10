import {
  Component,
  ElementRef,
  type OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import CodeEditorComponent from '../monaco-editor/component';
import { PlayGroundEvalViewNFCC } from '../playground-eval-view/component';

const DEBOUNCE_TIME = 500;

const DEFAULT_CODE = `(() => {
  // 可直接使用：v (valibot) / actions / setComponent / NFCSchema / valueChange ...
  let schema = v.object({
    name: v.pipe(v.string(), v.minLength(2, '至少 2 个字符'), v.description('姓名')),
    age: v.pipe(v.number(), v.minValue(18, '必须年满 18 岁'), v.description('年龄')),
    email: v.optional(v.pipe(v.string(), v.email('邮箱格式不正确'), v.description('邮箱'))),
    agree: v.pipe(v.boolean(), v.check((value) => value, '需要勾选同意')),
  });
  return { schema: schema, model: { name: 'Piying', age: 18, agree: false } };
})()`;

/** 与 code-eval.ts 注入的变量保持一致 */
const INJECTED_VARS = [
  'v (valibot)',
  'actions',
  'setComponent',
  'NFCSchema',
  'asVirtualGroup',
  'asControl',
  'nonFieldControl',
  'formConfig',
  'layout',
  'hideWhen',
  'disableWhen',
  'valueChange',
  'outputChange',
  'setAlias',
  'rawConfig',
  'condition',
  'renderConfig',
  'map',
  'tap',
  'skip',
  'of',
  'pipe',
  'debounceTime',
  'BehaviorSubject',
  'FocusDirective',
];

const COMPONENT_TYPES = [
  'string',
  'number',
  'boolean',
  'array',
  'record',
  'fieldset',
  'tabs',
  'steps',
  'validGroup',
  'filterGroup',
  'scrollGroup',
  'logic-group',
  'jsonSchema',
  'codeEditor',
];

/** 支持 ?input=<JSON.stringify(code)> 形式分享代码 */
function resolveInitialCode() {
  const raw = new URLSearchParams(window.location.search).get('input');
  if (!raw) {
    return DEFAULT_CODE;
  }
  let code = raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      code = parsed;
    }
  } catch {
    // 未做 JSON 编码的原始代码，直接使用
  }
  const trimmed = code.trim();
  if (!trimmed) {
    return DEFAULT_CODE;
  }
  // 已经是完整可执行代码（IIFE / 函数体）时直接使用
  if (trimmed.startsWith('(') || trimmed.startsWith('async')) {
    return trimmed;
  }
  // 对象字面量：包一层直接返回
  if (trimmed.startsWith('{')) {
    return `(() => {\n  return ${trimmed}\n})()`;
  }
  // 裸 schema 表达式：作为 schema 返回
  return `(() => {\n  let schema = ${trimmed}\n  return { schema: schema }\n})()`;
}

@Component({
  selector: 'app-playground-single',
  imports: [FormsModule, CodeEditorComponent, PlayGroundEvalViewNFCC],
  templateUrl: './component.html',
  // template:''
})
export class PlaygroundSingleComponent implements OnDestroy {
  code = signal(resolveInitialCode());
  previewCode = signal(this.code());
  shareText = signal('');

  injectedVars = INJECTED_VARS;
  componentTypes = COMPONENT_TYPES;

  helpDlg = viewChild<ElementRef<HTMLDialogElement>>('helpDlg');
  #changes = new Subject<string>();
  #subscription: Subscription;

  constructor() {
    this.#subscription = this.#changes
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((value) => this.previewCode.set(value));
  }

  ngOnDestroy(): void {
    this.#subscription.unsubscribe();
  }

  openHelp() {
    this.helpDlg()?.nativeElement.showModal();
  }

  updateCode(value: string) {
    this.code.set(value);
    this.#changes.next(value);
  }

  reset() {
    this.updateCode(DEFAULT_CODE);
  }

  async share() {
    const url = new URL(window.location.href);
    url.searchParams.set('input', JSON.stringify(this.code()));
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      this.shareText.set('分享链接已复制到剪贴板：' + link);
    } catch {
      this.shareText.set('复制失败，请手动复制地址栏链接，或访问：' + link);
    }
    window.setTimeout(() => this.shareText.set(''), 5000);
  }
}
