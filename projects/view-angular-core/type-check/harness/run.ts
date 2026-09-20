/**
 * 编译期断言 runner
 *
 * 扫描 cases/ 下的用例文件, 解析注释标记, 用 LanguageService 求值并汇总。
 *
 *   npm run test:typecheck            跑全部
 *   npm run test:typecheck -- hash    只跑文件名含 'hash' 的用例
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAssertions, CaseResult } from './check';
import { parseAssertions, stripTsExpectError } from './markers';
import { createFileChecker, loadOptions } from './service';

const here = path.dirname(fileURLToPath(import.meta.url));
const typeCheckDir = path.resolve(here, '..');
const repoRoot = path.resolve(typeCheckDir, '../../..');
const casesDir = path.join(typeCheckDir, 'cases');

function findCaseFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findCaseFiles(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out.sort();
}

const filter = process.argv[2];
const files = findCaseFiles(casesDir).filter(
  (f) => !filter || path.basename(f).includes(filter),
);

if (!files.length) {
  console.error(`没找到用例文件 (${casesDir}${filter ? ` 过滤: ${filter}` : ''})`);
  process.exit(1);
}

const options = loadOptions(path.join(typeCheckDir, 'tsconfig.json'));

let total = 0;
let failed = 0;
const failures: { file: string; r: CaseResult }[] = [];

for (const file of files) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  // 喂给编译器的文本要剔掉 @ts-expect-error, 否则诊断被抑制, 断言读不到东西。
  // 只清空注释内容, 行结构不变, 所以标记解析与偏移量都基于这一份文本。
  const text = stripTsExpectError(raw);

  let assertions;
  try {
    assertions = parseAssertions(text);
  } catch (e) {
    console.error(`✗ ${rel}  解析失败: ${(e as Error).message}`);
    failed += 1;
    continue;
  }

  const checker = createFileChecker(file, text, options, repoRoot);
  const results = runAssertions(assertions, checker, text);
  checker.dispose();

  const bad = results.filter((r) => !r.ok);
  total += results.length;
  failed += bad.length;
  failures.push(...bad.map((r) => ({ file: rel, r })));

  const mark = bad.length ? '✗' : '✓';
  console.log(
    `${mark} ${rel}  ${results.length - bad.length}/${results.length} 通过`,
  );
}

if (failures.length) {
  console.error('\n──────── 失败明细 ────────');
  for (const { file, r } of failures) {
    console.error(`\n✗ [${file}] ${r.name}`);
    for (const d of r.detail) console.error(`    ${d}`);
    if (r.actual) console.error(`    实际: ${r.actual}`);
  }
}

console.log(
  failed
    ? `\n编译期断言失败: ${failed}/${total}`
    : `\n编译期断言通过: ${total}/${total}`,
);
process.exit(failed ? 1 : 0);
