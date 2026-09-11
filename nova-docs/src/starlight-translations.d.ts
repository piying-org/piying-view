// 必须显式引入 starlight 入口，其类型图里的 global.d.ts 才会被加载，
// 从而为 App.Locals 补上 t / starlightRoute
import '@astrojs/starlight';

declare global {
  namespace StarlightApp {
    interface I18n {
      'docCopy.idle': string;
      'docCopy.done': string;
      'docCopy.failed': string;
    }
  }
}

export {};
