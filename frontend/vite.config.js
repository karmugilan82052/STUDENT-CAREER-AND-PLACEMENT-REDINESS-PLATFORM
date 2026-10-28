import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}
		})
	],
	resolve: {
		extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.svelte.js', '.svelte']
	},
	optimizeDeps: {
		include: ['@lucide/svelte', 'chart.js', 'chart.js/auto', 'firebase/app', 'firebase/auth', 'firebase/firestore']
	},
	server: {
		host: true,
		fs: {
			strict: false
		}
	}
});
