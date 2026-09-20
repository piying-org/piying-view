# 编译期断言 (type-check)

放「跑在浏览器里的 Karma spec 断言不了」的东西:

1. **编辑器补全集合** —— 需要 TypeScript LanguageService
2. **编译期诊断**(报错 / 不报错) —— 需要读编译器诊断, 且 fixture 本身要能故意带错

用例用**注释标记**声明, 一个标记 = 一条断言, 加用例不用改框架。

## 运行

```bash
npm run test:typecheck              # 跑全部
npm run test:typecheck -- hash      # 只跑文件名含 'hash' 的用例
```

已接入 `npm run test:ci`。

## 目录

```
type-check/
├── tsconfig.json       # 本目录专用编译配置(paths -> @piying/view-angular-core 源码)
├── harness/
│   ├── markers.ts      # 注释标记解析
│   ├── service.ts      # LanguageService 封装(内存 fixture, 不落盘)
│   ├── check.ts        # 断言求值
│   └── run.ts          # 入口: 扫描 cases/ 并汇总
└── cases/              # 用例
```

## 标记语法

### `@complete` —— 补全集合

游标用 `<|>` 写在字符串字面量里。

```ts
// @complete '#' 之后: 根级 key 全部可联想
//   include: text1, number1, nested
const c2 = xxx.get(['#', '<|>']);
```

| 子项 | 含义 |
|---|---|
| `include` | 必须出现在补全列表里 |
| `forbid` | 必须不出现 |
| `snapshot` | 锁死完整集合(排序后逐项比对) |

`snapshot` 用来记录**已知宽松度**。TS 对元组联合的补全是「按位取并集, 不按已写内容收窄」,
所以叶子之后仍会补出无关 key —— 这不是 bug 而是编译器限制。把它钉成快照, 将来行为一变就红,
强制复核, 而不是假装它是精确的。

### `@expect-error` —— 期望该行报错

```ts
// @expect-error '#' 出现在非首位
//   pattern: Type '"#"' is not assignable
// @ts-expect-error 见上两行标记
const e1 = xxx.get(['nested', '#']);
```

`pattern` 可省略(只断言"有错"), 但**建议写上**: 只断言"有错"断不出"是这条规则报的错",
类型别处崩了也会让它假绿。

必须同时写 `@ts-expect-error`: 前者给框架看, 后者让 IDE 不报红。
框架读诊断前会把 `@ts-expect-error` 剔掉(`stripTsExpectError`), 只清空注释内容,
行结构不变, 所以标记解析与偏移量都基于剔除后的文本。

### `@expect-no-error` —— 期望该行不报错

```ts
// @expect-no-error 上溯在余额内合法
const ok3 = xxx.get(['nested', 'deep', '..', '..']);
```

防止类型改过头, 把合法路径也拦掉。

## 注意

- `tsconfig.lib.json` 已排除 `type-check/**`, 否则故意带错的 fixture 会炸 `ng build view-core`。
- 用例统一用 `@piying/view-angular-core` 导入: 本 harness 就住在 view-angular-core 里, 测的也是它自己,
  不要写 `@piying/view-core`(那是生成产物)。
- `script/replace-pkg.ts` 会把 `projects/view-core/type-check` 删掉 —— 这是 view-angular-core 专用
  harness, 不该出现在生成产物里(其 tsconfig 的 paths 也不会被那个脚本改写)。
- fixture 必须落在仓库内, 否则 `valibot` 等裸导入沿目录上溯不到 `node_modules`。
