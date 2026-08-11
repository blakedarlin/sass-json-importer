import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import jestPlugin from 'eslint-plugin-jest';
import unicornPlugin from 'eslint-plugin-unicorn';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores([
		'**/node_modules/**',
		'**/.yarn',
		'**/.pnp.*',
		'**/build/**',
		'**/dist/**',
		'coverage',
		'docker',
	]),

	{
		files: ['**/*.{js,ts}'],
		plugins: { js },
		extends: ['js/recommended'],
	},

	// More than 100 powerful ESLint rules
	unicornPlugin.configs.recommended,

	// strict: a superset of recommended that includes more opinionated rules which may also catch bugs.
	...tseslint.configs.strictTypeChecked,

	// stylistic: additional rules that enforce consistent styling without significantly catching bugs or changing logic.
	...tseslint.configs.stylisticTypeChecked,

	{
		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	// ESLint plugin for Jest
	{
		files: ['**/*.test.ts'],
		...jestPlugin.configs['flat/recommended'],
	},
	// Turn off type-aware linting on specific subsets of files
	{
		files: ['**/*.js'],
		extends: [tseslint.configs.disableTypeChecked],
	},

	// Turns off all rules that are unnecessary or might conflict with Prettier.
	prettierConfig,
]);
