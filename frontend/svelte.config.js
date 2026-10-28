import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	onwarn: (warning, handler) => {
		if (warning.code && warning.code.startsWith('a11y_')) return;
		handler(warning);
	}
};

export default config;
