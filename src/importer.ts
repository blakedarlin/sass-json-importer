/* eslint-disable unicorn/no-null */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readFileSync, accessSync, constants } from 'node:fs';

import type {
	Importer,
	ImporterResult,
	CanonicalizeContext,
} from 'sass-embedded';

import JSONC from 'tiny-jsonc';

interface ImporterOptions {
	loadPaths?: string[];
	convertCase?: boolean;
	resolveWordPressInternals?: boolean;
	stringifyKeys?: boolean;
}

type JsonValue = string | number | boolean | null;
type JsonArray = (JsonValue | JsonObject)[];
interface JsonObject {
	[key: string]: JsonValue | JsonObject | JsonArray;
}

export default class JsonImporter implements Importer {
	options: ImporterOptions;
	nonCanonicalScheme = [
		'http',
		'https',
		'data',
		'blob',
		'javascript',
		'ssh',
		'wss',
	];

	constructor(options: ImporterOptions = {}) {
		this.options = options;
	}

	canonicalize(
		url: string | null,
		{ containingUrl }: CanonicalizeContext,
	): URL | null {
		if (url === null || !this.isJsonFile(url)) {
			return null;
		}

		const loadPaths = new Set<string>();

		// Add containingUrl directory if available
		if (containingUrl?.pathname) {
			const containingFilePath = fileURLToPath(containingUrl);
			loadPaths.add(path.dirname(containingFilePath));
		}

		// Then, add items from this.options.loadPaths
		for (const item of this.options.loadPaths ?? []) loadPaths.add(item);

		for (const loadPath of loadPaths) {
			try {
				const resolved = path.resolve(loadPath, url);
				accessSync(resolved, constants.R_OK);
				return new URL(`file://${resolved}`);
			} catch {
				// If the file is not accessible, simply proceed to the next path
			}
		}

		return null;
	}

	load(canonicalUrl: URL): ImporterResult | null {
		try {
			const filePath = fileURLToPath(canonicalUrl);
			const jsonContent = this.loadJsonFromPath(filePath);
			const contents = this.transformJsonToSass(jsonContent);

			return {
				contents: contents,
				syntax: 'scss',
				sourceMapUrl: canonicalUrl,
			} as ImporterResult;
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to load or transform JSON: ${message}`);
		}
	}

	// isJsonFile = (url: string): boolean => /\.js(on5?)?$/.test(url);
	isJsonFile = (url: string): boolean =>
		url.endsWith('.json') || url.endsWith('.jsonc');

	protected ensureObject(
		jsonContent: JsonObject,
		pathname: string,
	): JsonObject {
		return Array.isArray(jsonContent)
			? { [path.basename(pathname, path.extname(pathname))]: jsonContent }
			: jsonContent;
	}

	protected loadJsonFromPath = (filePath: string): JsonObject => {
		try {
			const fileContent = readFileSync(filePath, 'utf8');
			const jsonContent = JSONC.parse(fileContent) as JsonObject;
			return this.ensureObject(jsonContent, filePath);
		} catch (error: unknown) {
			throw new Error(
				`Failed to read or parse JSON from file ${filePath}: ${String(error)}`,
			);
		}
	};

	// WordPress theme.json uses colon in key names (':hover', ':focus', etc.), we need to allow for it.
	protected isValidKey = (key: string): boolean => /^:?[^$:@]*$/.test(key);

	protected isPlainObject = (
		value: JsonObject | JsonValue,
	): value is JsonObject =>
		value !== null && typeof value === 'object' && !Array.isArray(value);

	protected toKebabCase(key: string): string {
		return key
			.replaceAll(/([\da-z])([A-Z])/g, '$1-$2')
			.replaceAll(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
			.toLowerCase();
	}

	private processKeys(
		object: JsonObject,
		formatter: (key: string, value: JsonObject | JsonValue) => string,
	): string[] {
		return Object.keys(object)
			.filter((key) => this.isValidKey(key) && object[key] !== '#')
			.map((key) => {
				const convertedVariableName = this.options.convertCase
					? this.toKebabCase(key)
					: key;
				return formatter(
					convertedVariableName.replace(':', ''),
					object[key] as JsonObject | JsonValue,
				);
			});
	}

	// Empty strings must be explicitly quoted. (Sass would otherwise throw an error as the variable is set to nothing.)
	protected maybeQuoteStrings = (value: string): string =>
		value === '' || /[$%*+,/:@|]/.test(value) ? `'${value}'` : value;

	// Since WordPress 6.3.0, WP_Theme_JSON::resolve_variables resolves the internal link format to the CSS custom property.
	// E.g., "var:preset|color|secondary" -> "var(--wp--preset--color--secondary)". This likewise converts those types of values.
	protected resolveWordPressInternalLinks(value: string): string {
		// Matches var:string|string(|string...)
		const regex = /var:([\w-]+\|[\w-]+(\|[\w-]+)*)/g;

		return regex.test(value)
			? value.replaceAll(regex, (match) => {
					const processed = match.slice(4).replaceAll('|', '--');
					return `var(--wp--${processed})`;
				})
			: value;
	}

	protected transformJsonToSass(jsonContent: JsonObject) {
		return this.processKeys(
			jsonContent,
			(key, value) => `$${key}: ${this.parseValue(value)};`,
		).join('\n');
	}

	protected parseMap(jsonContent: JsonObject) {
		return `(${this.processKeys(jsonContent, (key, value) => {
			const mapKey = this.options.stringifyKeys ? `"${key}"` : key;

			return `${mapKey}: ${this.parseValue(value)}`;
		}).join(',')})`;
	}

	protected parseList(list: JsonValue[]) {
		return `(${list.map((value) => this.parseValue(value)).join(',')})`;
	}

	protected parseValue(value: JsonObject | JsonValue): string {
		if (Array.isArray(value)) {
			return this.parseList(value);
		} else if (this.isPlainObject(value)) {
			return this.parseMap(value);
		}

		// Convert numbers and booleans to string, and optionally resolve WordPress internal links.
		const stringValue = value?.toString() ?? '';
		const resolvedValue = this.options.resolveWordPressInternals
			? this.resolveWordPressInternalLinks(stringValue)
			: stringValue;
		return this.maybeQuoteStrings(resolvedValue);
	}
}
