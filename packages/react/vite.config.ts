import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
const outDir = '../../dist/view-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './dist',
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    // minify: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@piying/view-core',
        'static-injector',
        'valibot',
        'fast-equals',
      ],
      output: { dir: outDir },
    },
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
  },
});
