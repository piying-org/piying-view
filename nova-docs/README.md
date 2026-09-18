# Piying-View 文档站（Starlight Nova）

基于 [Astro Starlight](https://starlight.astro.build/) + [starlight-theme-nova](https://starlight-theme-nova.pages.dev) 主题构建的 Piying-View 文档站点。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:4321` 预览。

## 构建

```bash
pnpm build
pnpm preview   # 预览构建产物
```

## Playground 类型声明

Playground（`/zh/playground/`）编辑器的补全与诊断来自 `public/declaration/online-type.d.ts`，它是生成产物，源头是 `src/declaration/online-type.ts` + `tsconfig.online-type.json`：

```bash
pnpm build:online-type
```

- 依赖库（valibot / `@piying/view-angular` / `@piying/view-angular-core`）升级后需要重新生成并提交，否则编辑器里的类型和运行时不一致
- 给 Playground 用户代码新增注入变量时，必须同时改两处：`src/angular/components/playground-eval-view/code-eval.ts`（运行时注入）和 `src/declaration/online-type.ts`（类型声明），然后重新生成

## 自动生成的 API 文档

由 [starlight-typedoc](https://starlight-typedoc.vercel.app)（TypeDoc + typedoc-plugin-markdown）从源码直接生成，无需手写。

产物：`src/content/docs/{zh,en}/api-generated/<group>/`，已在 `.gitignore` 中，`dev` / `build` 时自动重建。

| group | 掩盖的包 | tsconfig | 入口 |
| ----- | ------- | -------- | ---- |
| `angular` | `view-core` / `view-angular` / `view-angular-core` | `tsconfig.typedoc.json` | `projects/*/index.ts` |
| `react` | `@piying/view-react` | `../packages/react/tsconfig.app.json` | `packages/react/src/index.ts` |
| `solid` | `@piying/view-solid` | `../packages/solid/tsconfig.app.json` | `packages/solid/src/index.ts` |

全部配置集中在 `astro.config.mjs` 的 `apiDocGroups`：一个分组 = 一份 tsconfig + 一组入口 + 侧边栏条目。新增包只改这一处。

几个坑：

- **为什么中英文各跑一遍**：插件会把生成物里的交叉链接写成绝对路径（`base + output` 前缀）。只生成一份的话，另一语言页面里的链接会硬指向这一语言。各跑一份后两边内容一致，只有链接前缀不同（共 6 次 TypeDoc，约 30 秒）。
- **为什么不用插件自带的 `typeDocSidebarGroup`**：生成目录必须放进语言目录，否则英文没有独立路由。但插件算出的 `autogenerate.directory` 已经带了 output 前缀，Starlight 再拼一次 locale 就变成 `zh/zh/api-generated/...`，匹配不到。所以侧边栏自己写 `autogenerate`，`directory` 不带语言前缀。
- **为什么 React / Solid 不能和 Angular 共用一份 tsconfig**：`jsx` / `jsxImportSource` 互斥（`react-jsx` vs `preserve` + `solid-js`），只能分组跑。
- **React / Solid 直接复用包自己的 `tsconfig.app.json`**：和真实构建一样从 `dist/view-core` 解析 `@piying/view-core`。注意 `projects/view-core` 是 `create-view-core` 生成的、已 gitignore，所以 CI 必须先跑 `npm run build:core`（已在 `.github/workflows/docs.yml` 里加上）。
- **Angular 组为什么要单独的 `tsconfig.typedoc.json`**：`projects/tsconfig.lib.json` 的 `inlineSources` 会报 `TS5051`；`test/` 不是 `*.spec.ts`以故排除不到；`extends` 后 `include` 默认落在 nova-docs 目录，TypeDoc 会报 “entry point is not referenced by tsconfig”。

生成时的 `Encountered an unknown block tag @description / @usageNotes / @publicApi` 和 `is referenced by ... but not included in the documentation` 只是警告，不影响生成：前者是源码沿用了 Angular 的注释标签，后者是内部类型没从 `index.ts` 导出。

## 目录结构

```
src/angular/               # 全部 Angular 代码（组件 / 指令 / 服务），必须待在这个目录里
  ├── components/          # Angular 组件与 definition/*.definition.ts
  ├── directive/           # 指令
  └── services/            # 可注入服务
src/components/            # Astro 组件（LivePreview.astro、SchemaPreview.astro）
src/content/docs/          # 文档源文件（Markdown），按语言分目录
  ├── zh/                  # 简体中文（默认语言，URL 前缀 /zh/）
  │   ├── getting-started/ # 入门使用
  │   ├── scenarios/       # 业务场景
  │   ├── api/             # API 参考
  │   ├── api-generated/    # 自动生成的 API 文档（不提交，dev/build 重建）
  │   ├── angular/         # Angular 专属
  │   ├── adapters/        # 框架适配
  │   └── index.md         # 首页（目录）
  └── en/                  # 英文（由 scripts/i18n 从 zh/ 生成，URL 前缀 /en/）
src/declaration/           # Playground 类型声明源文件（构建产物在 public/declaration/）
src/pages/index.astro      # 站点根路径 → /zh/
scripts/i18n/              # zh → en 翻译流水线（extract.mjs 导出待译行 / apply.mjs 生成 en）
astro.config.mjs           # Starlight + Nova 主题配置 + TypeDoc 生成 + 旧地址跳转
tsconfig.typedoc.json      # TypeDoc 专用类型配置
```

关于 `src/angular`：`@analogjs/astro-angular` 的 `transformFilter` 只放行 `/src/angular/`，目录外的 `.ts` 不会经过 Angular 编译器。带装饰器（`@Component` / `@Directive` / `@Injectable` 等）的代码写到外面，构建期不报错，渲染页面时才会抛出一个没有头绪的 `SyntaxError`。

## 配置说明

- 主题插件：`starlightThemeNova({ nav: [...] })` 配置顶部导航，`href` 由主题原样输出，需自己拼 `zh/` / `en/` 前缀
- 侧边栏：`starlight({ sidebar: [...] })` 配置分组与顺序，`link` 不带语言前缀，Starlight 会按当前语言自动补
- 多语言：`defaultLocale: 'zh'` + `locales: { zh, en }`，站内 Markdown 链接一律写成 `zh/xxx/`（英文为 `en/xxx/`），因为页面里有 `<base href>`，相对链接基于站点根解析
- 旧地址：`astro.config.mjs` 的 `legacyRedirects` 扫描 `docs/zh/` 生成 `/api/xxx/` → `/zh/api/xxx/`，避免迁移前的外链 404
- 内容集合：`src/content.config.ts` 通过 `glob` loader 加载 `src/content/docs` 下的 Markdown
