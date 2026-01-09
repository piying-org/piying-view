import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue2';
const outDir = '../../dist/view-vue';
export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      formats: ['es'],
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        // 'vue',
        'static-injector',
        '@piying/view-core/test',
        '@piying/view-core',
        'fast-equals',
        'rfdc',
      ],
      output: { dir: outDir },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      // vue: resolve(__dirname, 'node_modules/vue/dist/vue.esm.js'),
    },
  },
});
