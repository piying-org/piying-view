# providers — 注入业务服务

本文介绍 Actions 中 Providers 的管理方法（set / patch / change），将业务服务注入到字段组件的 Injector 中。

## actions.providers.set — 设置 Provider（覆盖）

将业务服务注入到字段组件的 Injector 中，组件可直接通过 `inject()` 使用：

```typescript
import { UserService } from './user.service';
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(v.string(), actions.providers.set([UserService]));
```

组件中使用：

```typescript
import { inject } from '@angular/core';

@Component({ ... })
export class MyInputComponent {
  private userSvc = inject(UserService);  // ✅ 直接注入，无需额外配置
}
```

## actions.providers.patch — 合并 Provider

在已有 Provider 上追加新的业务服务：

```typescript
import { LoggerService } from './logger.service';

const schema2 = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
  actions.providers.patch([LoggerService])
);
// 最终 providers = [UserService, LoggerService]
```

## actions.providers.change — 变更 Provider（函数式追加）

通过函数对现有 Provider 列表进行变换：

```typescript
import { AnalyticsService } from './analytics.service';

const schema3 = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
  actions.providers.change((providers) => [...providers, AnalyticsService])
);
// 最终 providers = [UserService, AnalyticsService]
```

## 下一步

- [API: wrappers](wrappers.md) — Wrapper 包装器完整指南（编写、V1/V2 语法）
- [API: global-config](global-config.md) — types/wrappers 全局配置优先级
