import {
  Component,
  ElementRef,
  type OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import JsonEditorComponent from '../json-monaco-editor/component';
import JsonSchemaViewRC from '../json-schema/component';

const DEBOUNCE_TIME = 500;

const DEFAULT_JSON = `{
  "schema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "title": "姓名",
        "minLength": 2,
        "description": "至少 2 个字符"
      },
      "age": { "type": "integer", "title": "年龄", "minimum": 18, "maximum": 150 },
      "role": { "type": "string", "title": "角色", "enum": ["admin", "user"] },
      "tags": {
        "type": "array",
        "title": "标签",
        "items": { "type": "string", "title": "标签", "enum": ["A", "B", "C"] }
      },
      "agree": { "type": "boolean", "title": "同意协议" },
      "address": {
        "type": "object",
        "title": "地址",
        "properties": {
          "city": { "type": "string", "title": "城市" },
          "street": { "type": "string", "title": "街道" }
        },
        "required": ["city"]
      }
    },
    "required": ["name", "age"]
  },
  "model": { "name": "Piying", "age": 18, "role": "admin", "agree": true }
}`;

interface Preview {
  data?: Record<string, any>;
  error?: string;
}

/** 支持 { schema, model } 包装，也支持直接书写 JSON Schema */
function parseJson(raw: string): Preview {
  const text = raw.trim();
  if (!text) {
    return {};
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { error: `JSON 解析失败：${(error as Error).message}` };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: 'JSON 根节点必须是对象' };
  }
  const value = parsed as Record<string, any>;
  if ('schema' in value) {
    return { data: { schema: value['schema'], model: value['model'] } };
  }
  return { data: { schema: value } };
}

/** 支持 ?input=<JSON.stringify(json)> 形式分享代码 */
function resolveInitialJson() {
  const raw = new URLSearchParams(window.location.search).get('input');
  if (!raw) {
    return DEFAULT_JSON;
  }
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return parsed;
    }
  } catch {
    // 未做 JSON 编码的原始文本，直接使用
  }
  return raw.trim() || DEFAULT_JSON;
}

@Component({
  selector: 'app-json-playground',
  imports: [FormsModule, JsonEditorComponent, JsonSchemaViewRC],
  templateUrl: './component.html',
})
export class JsonPlaygroundComponent implements OnDestroy {
  code = signal(resolveInitialJson());
  preview = signal<Preview>(parseJson(this.code()));
  shareText = signal('');

  helpDlg = viewChild<ElementRef<HTMLDialogElement>>('helpDlg');
  #changes = new Subject<string>();
  #subscription: Subscription;

  constructor() {
    this.#subscription = this.#changes
      .pipe(debounceTime(DEBOUNCE_TIME))
      .subscribe((value) => this.preview.set(parseJson(value)));
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
    this.updateCode(DEFAULT_JSON);
  }

  format() {
    try {
      this.updateCode(JSON.stringify(JSON.parse(this.code()), null, 2));
    } catch {
      // 非法 JSON 由预览区提示
    }
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
