import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    cache: false,
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },
    alias: {
      '@piying/view-react': path.join(process.cwd(), './src/index.ts'),
      '@piying/view-core/test': path.join(
        process.cwd(),
        '../../projects/view-core/test/index.ts',
      ),
      '@piying/view-core': path.join(
        process.cwd(),
        '../../projects/view-core/index.ts',
      ),
    },
  },
});
