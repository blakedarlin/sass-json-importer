/* eslint-disable unicorn/no-null */
import JsonImporter from '../importer.js';
import { compile } from 'sass-embedded';

describe('isJsonFile - checks if a file path has a valid JSON extension', () => {
	let jsonImporter: JsonImporter;

	beforeAll(() => {
		jsonImporter = new JsonImporter({});
	});

	it('should return true for .json files', () => {
		expect(jsonImporter.isJsonFile('file.json')).toBe(true);
		// expect(jsonImporter.isJsonFile('file.json5')).toBe(true);
		// expect(jsonImporter.isJsonFile('file.js')).toBe(true);
	});

	it('should return true for .jsonc files', () => {
		expect(jsonImporter.isJsonFile('file.jsonc')).toBe(true);
	});

	it('should return false for .json5/.js files', () => {
		expect(jsonImporter.isJsonFile('file.json5')).toBe(false);
		expect(jsonImporter.isJsonFile('file.js')).toBe(false);
	});

	it('should return false for non-json files', () => {
		expect(jsonImporter.isJsonFile('file.txt')).toBe(false);
		expect(jsonImporter.isJsonFile('filejson')).toBe(false);
	});

	it('should return true for paths with .json extension', () => {
		expect(jsonImporter.isJsonFile('/path/to/file.json')).toBe(true);
	});

	it('should return false for paths without .json extension', () => {
		expect(jsonImporter.isJsonFile('/path/to/file.txt')).toBe(false);
	});

	it('does not canonicalize non-JSON URLs', () => {
		expect(
			jsonImporter.canonicalize('file.txt', {
				fromImport: true,
				containingUrl: null,
			}),
		).toBe(null);
	});

	it('ignores non-JSON imports', () => {
		const jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
		});
		const sassOptions = { importers: [jsonImporter] };

		const result = compile(
			'./src/tests/fixtures/non-json.scss',
			sassOptions,
		);

		expect(result.css).toContain('color: #c33;');
	});
});
