import { computed } from '@angular/core';

export const AmdInit$$ = computed(
  () =>
    new Promise<void>((resolve) => {
      const el = document.createElement('script');
      el.src = './lib/monaco-editor/vs/loader.js';
      document.head.appendChild(el);
      el.onload = () => {
        (AMDLoader.global as any).require.config({
          paths: { vs: 'vs' },
          baseUrl: document.baseURI + 'lib/monaco-editor',
          preferScriptTags: true,
          'vs/nls': {
            availableLanguages: {
              '*': 'zh-cn',
            },
          },
        });

        (AMDLoader.global as any).require(['vs/editor/editor.main'], () => {
          resolve();
        });
      };
    }),
);
