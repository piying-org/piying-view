import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid'
import { resolve } from 'path';
const outDir = '../../dist/view-solid';

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid()],
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
        'solid-js',
        '@piying/view-core',
        'static-injector',
        'valibot',
        'fast-equals',
      ],
      output: { dir: outDir },
    },
    emptyOutDir: false,
  },
});
