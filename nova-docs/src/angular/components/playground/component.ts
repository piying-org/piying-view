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

interface PlaygroundDef {
  name: string;
  source: string;
  code: string;
}

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
  'appendLog',
  'map',
  'tap',
  'skip',
  'of',
  'pipe',
  'filter',
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

/** ?input=<JSON.stringify(code)> 形式分享代码，兼容裸 schema / 对象字面量 */
function resolveCodeParam(raw: string | null) {
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

/** URL 只读一次，定下初始来源：input 优先，def 需要异步取故单独分支 */
function resolveInitialSource():
  | { kind: 'def'; name: string }
  | { kind: 'code'; code: string } {
  const params = new URLSearchParams(window.location.search);
  const input = params.get('input');
  if (input) {
    return { kind: 'code', code: resolveCodeParam(input) };
  }
  const def = params.get('def');
  if (def) {
    return { kind: 'def', name: def };
  }
  return { kind: 'code', code: DEFAULT_CODE };
}

@Component({
  selector: 'app-playground-single',
  imports: [FormsModule, CodeEditorComponent, PlayGroundEvalViewNFCC],
  templateUrl: './component.html',
  // template:''
  host: {
    class: 'not-content',
  },
})
export class PlaygroundSingleComponent implements OnDestroy {
  code = signal('');
  previewCode = signal('');
  loading = signal(false);
  shareText = signal('');
  loadError = signal('');

  injectedVars = INJECTED_VARS;
  componentTypes = COMPONENT_TYPES;

  helpDlg = viewChild<ElementRef<HTMLDialogElement>>('helpDlg');
  #changes = new Subject<string>();
  #subscription: Subscription;
  #initialCode = DEFAULT_CODE;

  constructor() {
    this.#subscription = this.#changes
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((value) => this.previewCode.set(value));

    const source = resolveInitialSource();
    if (source.kind === 'def') {
      this.loading.set(true);
      void this.#loadDef(source.name);
    } else {
      this.#apply(source.code);
    }
  }

  ngOnDestroy(): void {
    this.#subscription.unsubscribe();
  }

  /** 代码唯一入口：一并同步 code / previewCode / 重置基准 */
  #apply(code: string) {
    this.#initialCode = code;
    this.code.set(code);
    this.previewCode.set(code);
  }

  async #loadDef(name: string) {
    const url = `${import.meta.env.BASE_URL}playground-defs/${encodeURIComponent(name)}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const def = (await res.json()) as PlaygroundDef;
      this.#apply(def.code);
    } catch {
      this.loadError.set(`无法载入文档示例「${name}」`);
    } finally {
      this.loading.set(false);
    }
  }

  openHelp() {
    this.helpDlg()?.nativeElement.showModal();
  }

  updateCode(value: string) {
    this.code.set(value);
    this.#changes.next(value);
  }

  reset() {
    this.#apply(this.#initialCode);
  }

  async share() {
    const url = new URL(window.location.href);
    // input 与 def 互斥：分享链接只带 input
    url.searchParams.delete('def');
    url.searchParams.set('input', JSON.stringify(this.code()));
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
      this.shareText.set('分享链接已复制到剪贴板：');
    } catch {
      this.shareText.set('复制失败，请手动复制：' + link);
    }
    window.setTimeout(() => this.shareText.set(''), 5000);
  }
}
