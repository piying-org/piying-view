import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformWithEsbuild } from 'vite';
import ts from 'typescript';
import { ROOT } from './preview-sources';

export const DEFINITION_DIR = 'src/angular/definition';

/** codeEval 能接收的返回字段，按此顺序拼进 return */
const RESULT_KEYS = ['schema', 'model', 'context', 'options', 'builderType'];

export function definitionFiles() {
  return readdirSync(resolve(ROOT, DEFINITION_DIR))
    .filter((f) => f.endsWith('.definition.ts'))
    .sort()
    .map((f) => `${DEFINITION_DIR}/${f}`);
}

/** 按 range 倒序切除，避免前面的切除影响后面的偏移 */
function cutRanges(source: string, ranges: [number, number][]) {
  let out = source;
  for (const [start, end] of [...ranges].sort((a, b) => b[0] - a[0])) {
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

/**
 * 用 TS AST 摘掉模块语法：删掉 import 声明、去掉 export 修饰符。
 * 只按节点 range 切除，其余源码原样保留，不靠正则匹配代码。
 */
function stripModuleSyntax(source: string, file: string) {
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );

  const ranges: [number, number][] = [];
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) || ts.isImportEqualsDeclaration(stmt)) {
      ranges.push([stmt.getStart(sf), stmt.getEnd()]);
      continue;
    }
    const mods = ts.canHaveModifiers(stmt) ? ts.getModifiers(stmt) : undefined;
    const exportKw = mods?.find((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (exportKw) {
      let end = exportKw.getEnd();
      while (source[end] === ' ') end++;
      ranges.push([exportKw.getStart(sf), end]);
    }
  }

  return cutRanges(source, ranges);
}

/**
 * 定义源码 → Playground 可直接执行的代码。
 * 定义文件是 TS，跑起来需要 JS：先按 AST 摘掉 import/export，再降级成 JS，
 * 最后包成 IIFE 返回 codeEval 约定的对象。
 */
export async function toPlaygroundCode(source: string, file: string) {
  const stripped = stripModuleSyntax(source, file);
  const { code } = await transformWithEsbuild(stripped, file, {
    loader: 'ts',
    target: 'esnext',
  });

  const sf = ts.createSourceFile(
    file,
    stripped,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );
  const exported = new Set<string>();
  for (const stmt of sf.statements) {
    const names = ts.isVariableStatement(stmt)
      ? stmt.declarationList.declarations.map((d) => d.name.getText(sf))
      : ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)
        ? [stmt.name?.getText(sf) ?? '']
        : [];
    names.forEach((n) => exported.add(n));
  }

  const keys = RESULT_KEYS.filter((k) => exported.has(k));
  if (!keys.includes('schema')) {
    throw new Error(`${file} 缺少 export const schema，无法在 Playground 中运行`);
  }

  return [
    '(() => {',
    `  // 来源: ${file}`,
    '  // import 已省略：v / setComponent / NFCSchema / actions 等由 Playground 注入',
    code.trim(),
    '',
    `  return { ${keys.join(', ')} };`,
    '})()',
    '',
  ].join('\n');
}
