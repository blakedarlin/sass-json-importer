import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import unicornPlugin from 'eslint-plugin-unicorn';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
	{
		ignores: [
			'**/node_modules/**',
			'**/.yarn',
			'**/.pnp.*',
			'**/build/**',
			'**/dist/**',
			'coverage',
			'docker',
		],
	},

	// Turns off all rules that are unnecessary or might conflict with Prettier.
	prettierConfig,

	// recommended eslint config
	eslint.configs.recommended,

	// More than 100 powerful ESLint rules
	unicornPlugin.configs['recommended'],

	// strict: a superset of recommended that includes more opinionated rules which may also catch bugs.
	...tseslint.configs.strictTypeChecked,

	// stylistic: additional rules that enforce consistent styling without significantly catching bugs or changing logic.
	...tseslint.configs.stylisticTypeChecked,

	{
		languageOptions: {
			globals: {
				...globals.node,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	// ESLint plugin for Jest
	{
		files: ['**/*.test.ts'],
		extends: [jestPlugin.configs['flat/recommended']],
	},
	// Turn off type-aware linting on specific subsets of files
	{
		files: ['**/*.js'],
		extends: [tseslint.configs.disableTypeChecked],
	},
);
