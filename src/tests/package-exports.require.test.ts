import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../..',
);

describe('CommonJS require via package exports', () => {
	let tempDir: string;
	let consumerScript: string;

	beforeAll(() => {
		execSync('npm run build', { cwd: packageRoot, stdio: 'pipe' });

		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sji-cjs-'));
		const scopedDir = path.join(tempDir, 'node_modules', '@blakedarlin');
		fs.mkdirSync(scopedDir, { recursive: true });
		fs.symlinkSync(packageRoot, path.join(scopedDir, 'sass-json-importer'));
		fs.symlinkSync(
			path.join(packageRoot, 'node_modules', 'tiny-jsonc'),
			path.join(tempDir, 'node_modules', 'tiny-jsonc'),
		);

		consumerScript = path.join(tempDir, 'consumer.cjs');
		fs.writeFileSync(
			consumerScript,
			/* javascript */ `
const jsonImporter = require('@blakedarlin/sass-json-importer');
const importer =
	typeof jsonImporter === 'function' ? jsonImporter() : null;
const result = {
	typeofExport: typeof jsonImporter,
	hasDefault: Object.hasOwn(jsonImporter, 'default'),
	hasCanonicalize: Boolean(importer && typeof importer.canonicalize === 'function'),
	hasLoad: Boolean(importer && typeof importer.load === 'function'),
};
process.stdout.write(JSON.stringify(result));
`,
		);
	});

	afterAll(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it('require() returns the importer factory as a callable function', () => {
		const output = execFileSync(process.execPath, [consumerScript], {
			encoding: 'utf8',
			cwd: tempDir,
		});
		const result = JSON.parse(output) as {
			typeofExport: string;
			hasDefault: boolean;
			hasCanonicalize: boolean;
			hasLoad: boolean;
		};

		expect(result.typeofExport).toBe('function');
		expect(result.hasCanonicalize).toBe(true);
		expect(result.hasLoad).toBe(true);
	});

	it('require() does not require accessing .default', () => {
		const output = execFileSync(process.execPath, [consumerScript], {
			encoding: 'utf8',
			cwd: tempDir,
		});
		const result = JSON.parse(output) as { hasDefault: boolean };

		expect(result.hasDefault).toBe(false);
	});
});
