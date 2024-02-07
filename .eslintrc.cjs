module.exports = {
	root: true,
	extends: [
		'xo',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/prettier',
		'prettier',
	],
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2021,
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	rules: {
		quotes: [1, 'double', {avoidEscape: true, allowTemplateLiterals: true}],
	},
	settings: {
		'svelte3/typescript': true,
	},
};
