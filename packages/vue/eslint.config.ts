import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';
import pluginPlaywright from 'eslint-plugin-playwright';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import unusedImports from 'eslint-plugin-unused-imports';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  skipFormatting,
  {
    rules: {
      'arrow-body-style': ['warn', 'as-needed'],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-private-class-members': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-useless-catch': 'off',
      'no-constant-condition': 'off',
      'no-empty': 'off',
      'no-empty-pattern': 'off',
      'no-unsafe-finally': 'off',
      'no-async-promise-executor': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      eqeqeq: 'warn',
      'no-useless-computed-key': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'vue/multi-word-component-names': [
        'off',
        {
          ignores: ['input'],
        },
      ],
      'vitest/valid-expect':'off'
    },
  },
);
