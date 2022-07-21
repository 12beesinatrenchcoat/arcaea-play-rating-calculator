import adapter from '@sveltejs/adapter-static';
import preprocess from "svelte-preprocess";

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
	},
	preprocess: preprocess({})
};

export default config;
