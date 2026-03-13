import JsonImporter from '../importer.js';
import { AsyncCompiler, initAsyncCompiler } from 'sass-embedded';

describe('Skip importing invalid variables (JSON)', () => {
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

	it('ignores variables starting with @ or $', async () => {
		const result = await compiler.compileStringAsync(
			`@use "invalid-variables.json"; body { color: invalid-variables.$colors; }`,
			sassOptions,
		);
		expect(result.css).toContain('color: "";');
	});

	it('strips leading : from variables starting with :', async () => {
		const result = await compiler.compileStringAsync(
			`@use "invalid-variables.json"; body { color: invalid-variables.$hover; }`,
			sassOptions,
		);
		expect(result.css).toContain('color: #33c;');
	});

	it('strips leading : from nested map keys starting with :', async () => {
		const result = await compiler.compileStringAsync(
			`@use 'sass:map'; @use "invalid-variables.json"; body { color: map.get(invalid-variables.$nested, disabled); }`,
			sassOptions,
		);
		expect(result.css).toContain('color: #3c3;');
	});

	it('filters out `#` as variable value', async () => {
		const result = await compiler.compileStringAsync(
			`@use "invalid-variables.json"; body { color: invalid-variables.$colors; }`,
			sassOptions,
		);
		expect(result.css).toContain('color: "";');
	});
});
