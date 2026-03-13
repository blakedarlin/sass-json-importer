import JsonImporter from '../importer.js';
import {
	AsyncCompiler,
	initAsyncCompiler,
	Exception as SassException,
} from 'sass-embedded';
import { URL } from 'node:url';
import { jest } from '@jest/globals';

let compiler: AsyncCompiler;
let jsonImporter: JsonImporter;
let sassOptions: object;

describe('loadJsonFromPath - error on invalid JSON content', () => {
	beforeAll(async () => {
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
		});
		compiler = await initAsyncCompiler();
		sassOptions = { importers: [jsonImporter] };
	});

	afterAll(async () => {
		await compiler.dispose();
	});

	it('throws an error when parsing unclosed brace', async () => {
		let caughtError: unknown;

		try {
			await compiler.compileStringAsync(
				'@use "invalid-json-no-closing-brace.json"',
				sassOptions,
			);
		} catch (error) {
			caughtError = error;
		}

		expect((caughtError as SassException).sassMessage).toContain(
			'Failed to read or parse JSON from file',
		);
	});

	it('throws an error when parsing an unquoted key', async () => {
		let caughtError: unknown;

		try {
			await compiler.compileStringAsync(
				'@use "invalid-json-unquoted-key.json"',
				sassOptions,
			);
		} catch (error) {
			caughtError = error;
		}

		expect((caughtError as SassException).sassMessage).toContain(
			'Failed to read or parse JSON from file',
		);
	});
});

describe('loadJsonFromPath - error if JSON-to-Sass transform fails', () => {
	let mockUrl: URL;

	beforeAll(async () => {
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
		});
		compiler = await initAsyncCompiler();
		sassOptions = { importers: [jsonImporter] };
		mockUrl = new URL('file:///mock/path/to/file.json');
	});

	afterAll(async () => {
		await compiler.dispose();
	});

	beforeEach(() => {
		// Spy on loadJsonFromPath and return an empty object
		jest.spyOn(jsonImporter as any, 'loadJsonFromPath').mockReturnValue({}); // eslint-disable-line @typescript-eslint/no-explicit-any
	});

	it('throws an error with the error message when transformJsonToSass throws a standard Error', () => {
		// Mock transformJsonToSass to throw an error
		jest.spyOn(
			jsonImporter as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			'transformJsonToSass',
		).mockImplementation(() => {
			throw new Error('Mock transformation error');
		});

		// Verify that an error is thrown with the correct message
		expect(() => jsonImporter.load(mockUrl)).toThrow(
			'Failed to load or transform JSON: Mock transformation error',
		);
	});

	it('throws an error with a specific message when transformJsonToSass throws a non-Error', () => {
		// Mock transformJsonToSass to throw an error
		jest.spyOn(
			jsonImporter as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			'transformJsonToSass',
		).mockImplementation(() => {
			// eslint-disable-next-line @typescript-eslint/only-throw-error
			throw 'foo';
		});

		// Verify that an error is thrown with the correct message
		expect(() => jsonImporter.load(mockUrl)).toThrow(
			'Failed to load or transform JSON: foo',
		);
	});
});
