/** 补全集合断言 */
export type CompleteAssertion = {
  kind: 'complete';
  name: string;
  /** 目标语句所在行(1-based) */
  line: number;
  /** '<|>' 在文件中的字符偏移 */
  pos: number;
  include: string[];
  forbid: string[];
  snapshot?: string[];
};

/** 期望该行产生编译诊断 */
export type ExpectErrorAssertion = {
  kind: 'expect-error';
  name: string;
  line: number;
  /** 期望诊断消息包含的片段 */
  pattern?: string;
};

/** 期望该行不产生编译诊断 */
export type ExpectNoErrorAssertion = {
  kind: 'expect-no-error';
  name: string;
  line: number;
};

export type Assertion =
  | CompleteAssertion
  | ExpectErrorAssertion
  | ExpectNoErrorAssertion;

export const CURSOR = '<|>';

const splitList = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** 取注释行里 '@' 之后的内容, 不是标记则返回 null */
const markerOf = (line: string): string | null => {
  const m = /^\s*\/\/\s*@(\S+)(.*)$/.exec(line);
  if (!m) return null;
  return `${m[1]} ${m[2]}`.trim();
};

/**
 * 剔掉 '// @ts-expect-error' 抑制行, 让诊断重新暴露。
 * 用例文件同时带 '@expect-error'(框架的断言源) 与 '@ts-expect-error'(IDE 不报红):
 * 前者给框架看, 后者给编辑器看。
 */
export const stripTsExpectError = (text: string): string =>
  text.replace(/^[ \t]*\/\/[ \t]*@ts-expect-error[^\n]*/gm, '');

/**
 * 解析用例文件里的所有标记。
 * 标记块必须紧贴其目标语句上方。
 */
export function parseAssertions(text: string): Assertion[] {
  const lines = text.split(/\r?\n/);
  const out: Assertion[] = [];

  for (let i = 0; i < lines.length; i++) {
    const head = markerOf(lines[i]);
    if (!head) continue;

    const sp = head.indexOf(' ');
    const keyword = sp < 0 ? head : head.slice(0, sp);
    const name =
      (sp < 0 ? '' : head.slice(sp + 1)).trim() || `(未命名 @${keyword})`;

    // 收集紧随其后的 "key: value" 子注释行
    const props = new Map<string, string>();
    let j = i + 1;
    if (keyword === 'complete' || keyword === 'expect-error') {
      for (; j < lines.length; j++) {
        const m = /^[ \t]*\/\/[ \t]+(\w+)[ \t]*:[ \t]*(.*)$/.exec(lines[j]);
        if (!m) break;
        props.set(m[1], m[2]);
      }
    }

    // 跳过空行与普通注释, 定位目标语句
    while (
      j < lines.length &&
      (/^\s*$/.test(lines[j]) || /^\s*\/\//.test(lines[j]))
    ) {
      j++;
    }
    if (j >= lines.length) {
      throw new Error(`标记 @${keyword} "${name}" 后面没有目标语句`);
    }

    const line = j + 1;
    const lineText = lines[j];

    if (keyword === 'complete') {
      const col = lineText.indexOf(CURSOR);
      if (col < 0) {
        throw new Error(
          `@complete "${name}" 的目标行缺少 '${CURSOR}' 游标: ${lineText.trim()}`,
        );
      }
      const offset = lines.slice(0, j).reduce((n, l) => n + l.length + 1, 0);
      out.push({
        kind: 'complete',
        name,
        line,
        pos: offset + col,
        include: splitList(props.get('include') ?? ''),
        forbid: splitList(props.get('forbid') ?? ''),
        snapshot: props.has('snapshot')
          ? splitList(props.get('snapshot') as string)
          : undefined,
      });
    } else if (keyword === 'expect-error') {
      out.push({
        kind: 'expect-error',
        name,
        line,
        pattern: props.get('pattern') || undefined,
      });
    } else if (keyword === 'expect-no-error') {
      out.push({ kind: 'expect-no-error', name, line });
    } else {
      throw new Error(`未知标记 @${keyword}`);
    }

    i = j - 1;
  }

  return out;
}

/** 字符偏移 → 1-based 行号 */
export const lineOf = (text: string, start: number): number =>
  text.slice(0, start).split('\n').length;

/** 游标所在字符串字面量的 [start, end) —— 该范围内的诊断属预期, 应忽略 */
export const cursorSpan = (
  text: string,
  pos: number,
): { start: number; end: number } => {
  const start = text.lastIndexOf("'", pos);
  const end = text.indexOf("'", pos + 1) + 1;
  return { start, end };
};
