import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_ATTR = 'data-theme';

/** 全站主题监听（<html data-theme="dark">），单例，任何组件均可注入 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<string | null>(null);
  readonly isDark = computed(() => this.theme() === 'dark');
  /** monaco 编辑器主题 */
  readonly monacoTheme = computed(() => (this.isDark() ? 'vs-dark' : 'vs'));

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    this.#sync();
    new MutationObserver(() => this.#sync()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTR],
    });
  }

  #sync() {
    this.theme.set(document.documentElement.getAttribute(THEME_ATTR));
  }
}
