import JsonImporter from '../importer.js';
import { AsyncCompiler, initAsyncCompiler } from 'sass-embedded';

describe('Import type test (JSON)', () => {
	let compiler: AsyncCompiler;
	let jsonImporter: JsonImporter;
	let sassOptions: object;
	let expectedResult: string;

	beforeAll(async () => {
		expectedResult = 'color: #c33;';
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
		});
		compiler = await initAsyncCompiler();
		sassOptions = { importers: [jsonImporter] };
	});

	afterAll(async () => {
		await compiler.dispose();
	});

	it('imports strings', async () => {
		const result = await compiler.compileStringAsync(
			`@use "strings.json"; body { color: strings.$color-red; }`,
			sassOptions,
		);
		expect(result.css).toContain(expectedResult);
	});

	it('quotes strings with special characters', async () => {
		const result = await compiler.compileStringAsync(
			`@use "strings.json"; body { content: strings.$css; }`,
			sassOptions,
		);
		expect(result.css).toContain(
			'content: "&:hover { color: red; }"',
		);
	});

	it('imports empty strings correctly', async () => {
		const result = await compiler.compileStringAsync(
			`@use "empty-string.json"; body { color: empty-string.$colors; }`,
			sassOptions,
		);
		expect(result.css).toContain('color: ""');
	});

	it('imports null as empty string', async () => {
		const result = await compiler.compileStringAsync(
			`@use "empty-string.json"; body { color: empty-string.$nullvalue; }`,
			sassOptions,
		);
		expect(result.css).toContain('color: ""');
	});

	it('imports lists', async () => {
		const result = await compiler.compileStringAsync(
			`@use 'sass:list'; @use "lists.json"; body { color: list.nth(lists.$colors, 1); }`,
			sassOptions,
		);
		expect(result.css).toContain(expectedResult);
	});

	it('imports maps', async () => {
		const result = await compiler.compileStringAsync(
			`@use 'sass:map'; @use "maps.json"; body { color: map.get(maps.$colors, red); }`,
			sassOptions,
		);
		expect(result.css).toContain(expectedResult);
	});

	it('with stringifyKeys: true, imports maps with quoted keys', async () => {
		const jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
			stringifyKeys: true,
		});

		const options = { importers: [jsonImporter] };

		const result = await compiler.compileStringAsync(
			`@use 'sass:map'; @use "maps.json"; body { color: map.get(maps.$colors, "red"); }`,
			options,
		);

		expect(result.css).toContain(expectedResult);
	});

	it('imports maps with array as top level', async () => {
		const result = await compiler.compileStringAsync(
			`@use 'sass:list'; @use "array.json"; body { color: list.nth(array.$array, 1); }`,
			sassOptions,
		);
		expect(result.css).toContain(expectedResult);
	});
});
