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

## 目录结构

```
src/content/docs/          # 文档源文件（Markdown）
  ├── getting-started/     # 入门使用
  ├── scenarios/           # 业务场景
  ├── api/                 # API 参考
  ├── adapters/            # 框架适配
  └── index.md             # 首页（目录）
astro.config.mjs           # Starlight + Nova 主题配置
```

## 配置说明

- 主题插件：`starlightThemeNova({ nav: [...] })` 配置顶部导航
- 侧边栏：`starlight({ sidebar: [...] })` 配置分组与顺序
- 内容集合：`src/content.config.ts` 通过 `glob` loader 加载 `src/content/docs` 下的 Markdown
