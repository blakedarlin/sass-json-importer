import JsonImporter from '../importer.js';
import { AsyncCompiler, initAsyncCompiler } from 'sass-embedded';

describe('toKebabCase - Convert keys to kebab case', () => {
	let compiler: AsyncCompiler;
	let jsonImporter: JsonImporter;

	beforeAll(async () => {
		compiler = await initAsyncCompiler();
	});

	afterAll(async () => {
		await compiler.dispose();
	});

	it('converts variables to kebab case when convertCase is true', async () => {
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
			convertCase: true,
		});

		const result = await compiler.compileStringAsync(
			`@use "strings.json"; body { color: strings.$color-green; }`,
			{ importers: [jsonImporter] },
		);
		expect(result.css).toContain('color: #3c3;');
	});

	it('converts map keys to kebab case when convertCase is true', async () => {
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
			convertCase: true,
		});

		const result = await compiler.compileStringAsync(
			`@use 'sass:map'; @use "maps.json"; body { color:  map.get(maps.$colors, light-blue); }`,
			{ importers: [jsonImporter] },
		);
		expect(result.css).toContain('color: #acf;');
	});

	it('imports unmodified variables when convertCase is false', async () => {
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
			convertCase: false,
		});

		const result = await compiler.compileStringAsync(
			`@use "strings.json"; body { color: strings.$colorGreen; }`,
			{ importers: [jsonImporter] },
		);
		expect(result.css).toContain('color: #3c3;');
	});

	it('imports unmodified variables when convertCase is not set', async () => {
		jsonImporter = new JsonImporter({
			loadPaths: ['./src/tests/fixtures'],
		});

		const result = await compiler.compileStringAsync(
			`@use "strings.json"; body { color: strings.$colorGreen; }`,
			{ importers: [jsonImporter] },
		);
		expect(result.css).toContain('color: #3c3;');
	});
});
