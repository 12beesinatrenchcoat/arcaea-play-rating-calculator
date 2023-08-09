import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			base:
				process.env.NODE_ENV === 'development'
					? ''
					: '/arcaea-play-rating-calculator',
		},
	},
	preprocess: preprocess({}),
};

export default config;
