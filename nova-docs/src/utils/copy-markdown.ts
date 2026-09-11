import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { globSync } from 'tinyglobby';
import { unified } from 'unified';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import MagicString from 'magic-string';
import {
  ROOT,
  resolveLivePreviewFiles,
  resolveSchemaPreviewFiles,
  type AttrValue,
  type Attrs,
} from './preview-sources';

const docsDir = 'src/content/docs';

const LANGS: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  html: 'html',
  css: 'css',
  json: 'json',
  vue: 'vue',
  svelte: 'svelte',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
};

// 预览组件的源码读取规则，文件解析复用 preview-sources，与组件行为一致
const PREVIEW_READERS: Record<string, (attrs: Attrs) => Promise<string>> = {
  LivePreview: (attrs) => fenceFiles(resolveLivePreviewFiles(attrs)),
  SchemaPreview: (attrs) => fenceFiles(resolveSchemaPreviewFiles(attrs)),
};

const PREVIEW_COMPONENTS = new Set(Object.keys(PREVIEW_READERS));

// 只做解析，不重新序列化：保留原文格式，按 offset 精准替换目标区间
const parser = unified().use(remarkParse).use(remarkMdx);

type Edit = { start: number; end: number; text: string };

// 从 JSX 表达式的 estree 里取出字符串字面量，兼容 `['a', 'b']` 这类写法
function collectStringLiterals(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out;
  const n = node as Record<string, unknown>;
  if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value);
  for (const [key, val] of Object.entries(n)) {
    if (key === 'loc' || key === 'range' || key === 'comments') continue;
    if (Array.isArray(val)) val.forEach((v) => collectStringLiterals(v, out));
    else collectStringLiterals(val, out);
  }
  return out;
}

function attrValue(attr: Record<string, any>): AttrValue | null {
  if (typeof attr.value === 'string') return attr.value;
  if (attr.type !== 'mdxJsxExpressionAttribute') return null;
  const program = attr.data?.estree;
  if (!program) return null;
  const expr = program.body?.[0]?.expression ?? program;
  const literals = collectStringLiterals(expr);
  return literals.length ? literals : null;
}

function jsxAttributes(node: any): Attrs {
  const attrs = new Map<string, AttrValue>();
  for (const attr of node.attributes ?? []) {
    if (attr.type !== 'mdxJsxAttribute') continue;
    const value = attrValue(attr);
    if (value != null) attrs.set(attr.name, value);
  }
  return attrs;
}

export function sourcePathToSlug(file: string) {
  return file
    .replace(`${docsDir}/`, '')
    .replace(/\.(mdx|md)$/, '')
    .replace(/\/index$/, '');
}

function slugToSourcePath(slug: string) {
  for (const ext of ['mdx', 'md']) {
    const file = `${docsDir}/${slug}.${ext}`;
    if (existsSync(resolve(ROOT, file))) return file;
  }
  return null;
}

export function allDocSourcePaths() {
  return globSync(`${docsDir}/**/*.{md,mdx}`, { cwd: ROOT, dot: true });
}

function codeFence(code: string, lang: string, title: string) {
  const longest = (code.match(/`+/g) ?? []).reduce(
    (max, s) => Math.max(max, s.length),
    0,
  );
  const mark = '`'.repeat(Math.max(3, longest + 1));
  return `${mark}${lang} title="${title}"\n${code.replace(/\s+$/, '')}\n${mark}`;
}

async function fenceFile(file: string) {
  const code = await readFile(resolve(ROOT, file), 'utf-8');
  return codeFence(code, LANGS[extname(file).slice(1)] ?? 'text', file);
}

async function fenceFiles(files: string[]) {
  const blocks = await Promise.all(files.map(fenceFile));
  return blocks.join('\n\n');
}

/**
 * 把 mdx 源文本转换为「可复制」的 markdown：
 * 预览组件替换为其读取到的源码代码块，组件导入与纯预览标签一并移除。
 * 解析交给 MDX parser，只按节点 offset 改写源文本，其余内容原样保留。
 */
export async function buildCopyMarkdown(raw: string) {
  let tree: any;
  try {
    tree = parser.parse(raw);
  } catch {
    return raw.trim();
  }

  const edits: Array<Edit | Promise<Edit>> = [];

  visit(tree, (node: any) => {
    const start = node.position?.start?.offset;
    const end = node.position?.end?.offset;
    if (typeof start !== 'number' || typeof end !== 'number') return;
    if (node.type === 'mdxjsEsm') {
      if (String(node.value ?? '').startsWith('import '))
        edits.push({ start, end, text: '' });
      return;
    }

    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement')
      return;

    const attrs = jsxAttributes(node);
    if (PREVIEW_COMPONENTS.has(node.name)) {
      edits.push(
        PREVIEW_READERS[node.name](attrs).then((text) => ({
          start,
          end,
          text,
        })),
      );
    } else {
      edits.push({ start, end, text: '' });
    }
  });

  const s = new MagicString(raw);
  const sorted = (await Promise.all(edits)).sort(
    (a, b) => b.start - a.start || a.end - b.end,
  );
  for (const { start, end, text } of sorted) {
    if (text === '') s.remove(start, end);
    else s.update(start, end, text);
  }

  return s
    .toString()
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function getDocCopyMarkdown(slug: string) {
  const file = slugToSourcePath(slug);
  if (!file) return null;
  const raw = await readFile(resolve(ROOT, file), 'utf-8');
  const text = await buildCopyMarkdown(raw);
  // 只剩 frontmatter 的页面（如 Playground）没有可复制的正文
  return stripFrontmatter(text).trim() ? text : null;
}

function stripFrontmatter(text: string) {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
  return match ? text.slice(match[0].length) : text;
}
