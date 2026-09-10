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

Playground（`/playground/`）编辑器的补全与诊断来自 `public/declaration/online-type.d.ts`，它是生成产物，源头是 `src/declaration/online-type.ts` + `tsconfig.online-type.json`：

```bash
pnpm build:online-type
```

- 依赖库（valibot / `@piying/view-angular` / `@piying/view-angular-core`）升级后需要重新生成并提交，否则编辑器里的类型和运行时不一致
- 给 Playground 用户代码新增注入变量时，必须同时改两处：`src/angular/components/playground-eval-view/code-eval.ts`（运行时注入）和 `src/declaration/online-type.ts`（类型声明），然后重新生成

## 目录结构

```
src/angular/               # 全部 Angular 代码（组件 / 指令 / 服务），必须待在这个目录里
  ├── components/          # Angular 组件与 definition/*.definition.ts
  ├── directive/           # 指令
  └── services/            # 可注入服务
src/components/            # Astro 组件（LivePreview.astro、SchemaPreview.astro）
src/content/docs/          # 文档源文件（Markdown）
  ├── getting-started/     # 入门使用
  ├── scenarios/           # 业务场景
  ├── api/                 # API 参考
  ├── adapters/            # 框架适配
  └── index.md             # 首页（目录）
src/declaration/           # Playground 类型声明源文件（构建产物在 public/declaration/）
astro.config.mjs           # Starlight + Nova 主题配置
```

关于 `src/angular`：`@analogjs/astro-angular` 的 `transformFilter` 只放行 `/src/angular/`，目录外的 `.ts` 不会经过 Angular 编译器。带装饰器（`@Component` / `@Directive` / `@Injectable` 等）的代码写到外面，构建期不报错，渲染页面时才会抛出一个没有头绪的 `SyntaxError`。

## 配置说明

- 主题插件：`starlightThemeNova({ nav: [...] })` 配置顶部导航
- 侧边栏：`starlight({ sidebar: [...] })` 配置分组与顺序
- 内容集合：`src/content.config.ts` 通过 `glob` loader 加载 `src/content/docs` 下的 Markdown
