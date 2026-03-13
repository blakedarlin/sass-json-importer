import JsonImporter from '../importer.js';
import {
	AsyncCompiler,
	initAsyncCompiler,
	Exception as SassException,
} from 'sass-embedded';

describe('loadJsonFromPath - error on invalid JSON content', () => {
	let compiler: AsyncCompiler;
	let jsonImporter: JsonImporter;
	let sassOptions: object;

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
