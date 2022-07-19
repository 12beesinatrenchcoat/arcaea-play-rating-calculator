import adapter from '@sveltejs/adapter-static';

const dev = "production" === "development";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		prerender: {
			default: true
		},
		paths: {
			base: dev ? "" : "/arcaea-play-rating-calculator",
		},
	}
};

export default config;
