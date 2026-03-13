# Changelog

## 1.2.2

- Update packages.
- Fix linting errors.
- Fix Sass deprecation warnings in tests.

## 1.2.0

### Features

- Add `stringifyKeys` option to turn all map keys into strings in generated scss.
- Support JSONC

## 1.1.1

### Fixes

- Fix Prettier configuration.

## 1.1.0

- Add TypeScript types.

### Fixes

- Fix importing absolute file paths with special characters that would otherwise cause errors.
- Fix Jest configuration.
- Fix TypeScript configuration.

## 1.0.0

- Refactor methods.
- Remove lodash dependency.
- Define JSON types.
- Throw errors when loading and transforming JSON fail.
- Update dependencies.

### Features

- Add containingUrl directory to loadPaths.
- Add support for the WordPress theme.json.
- Resolve WordPress internal links in the same way as WP_Theme_JSON::resolve_variables.
- Add support for JSON keys beginning with colons (e.g., ":hover"), and remove the colon when transforming to Sass.

### Fixes

- Restore convertCase option.
- No longer accept .js and .json5 files that won't be parsed.
- Fix importing strings with special characters that would otherwise cause errors.
- Add Jest tests.
