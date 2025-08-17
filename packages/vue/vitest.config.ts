import { mergeConfig, defineConfig } from 'vitest/config';
import viteConfig from './vite.config';
import path from 'node:path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      cache: false,
      name: 'browser',
      browser: {
        enabled: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }],
        ui: true,
      },
      alias: {
        '@piying/view-vue': path.join(process.cwd(), './src/index.ts'),
        '@piying/view-core/test': path.join(
          process.cwd(),
          '../../projects/view-core/test/index.ts',
        ),
        '@piying/view-core': path.join(process.cwd(), '../../projects/view-core/index.ts'),
      },
    },
  }),
);
