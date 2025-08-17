import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [svelte()],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			}
		],
		alias: {
			'@piying/view-svelte': path.join(process.cwd(), './src/lib/index.ts'),
			'@piying/view-core/test': path.join(process.cwd(), '../../projects/view-core/test/index.ts'),
			'@piying/view-core': path.join(process.cwd(), '../../projects/view-core/index.ts')
		}
	}
});
