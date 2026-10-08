# sass-json-importer

JSON importer for [sass-embedded](https://github.com/sass/embedded-host-node). Allows `@use`ing/`@import`ing `.json` files in Sass files parsed by `sass-embedded`, using the [Importer API](https://sass-lang.com/documentation/js-api/interfaces/importer/).

Requires **Node.js 22.12 or later** (needed for `require()` of this ESM package).

## Usage

### [sass-embedded](https://github.com/sass/embedded-host-node)

CommonJS:

```javascript
const sass = require('sass-embedded');
const jsonImporter = require('@blakedarlin/sass-json-importer');

const sassOptions = {
	importers: [jsonImporter()],
};

// Sync
const result = sass.compile(scssFilename, sassOptions);

// Async
const result = await sass.compileAsync(scssFilename, sassOptions);
```

ES modules:

```javascript
import * as sass from 'sass-embedded';
import jsonImporter from '@blakedarlin/sass-json-importer';

const sassOptions = {
	importers: [jsonImporter()],
};

const result = sass.compile(scssFilename, sassOptions);
```

## loadPaths

```javascript
loadPaths?: string[]
```

The importer accepts a `loadPaths` option, which is a string array of absolute paths. The Sass file's own parent is automatically added as the first `loadPaths` item, so there is no need to specify it.

```javascript
const result = sass.compile(scssFilename, {
	importers: [
		jsonImporter({ loadPaths: ['/some/path', '/src/node_modules'] }),
	],
});
```

## camelCase to kebab-case

```javascript
convertCase?: boolean
```

Whether to convert standard JavaScript camelCase keys into CSS/SCSS compliant kebab-case keys. Default is `false`. Example:

`variables.json`:

```json
{
	"bgBackgroundColor": "red"
}
```

`style.scss`:

```scss
@import 'variables.json';

div {
	background: $bg-background-color;
}
```

To enable the `convertCase` option:

```javascript
const result = sass.compile(scssFilename, {
	importers: [jsonImporter({ convertCase: true })],
});
```

## WordPress internal links

```javascript
resolveWordPressInternals?: boolean
```

Whether to convert WordPress-style internal links to CSS custom properties. Default is `false`.

Since WordPress 6.3.0, `WP_Theme_JSON::resolve_variables` resolves the internal link format to the CSS custom property. E.g., `var:preset|color|secondary` -> `var(--wp--preset--color--secondary)`. This option likewise converts those types of values when present in the JSON.

```javascript
const result = sass.compile(scssFilename, {
	importers: [jsonImporter({ resolveWordPressInternals: true })],
});
```

## Stringify keys in a map

By default, in a map all keys are imported unstringified.

A json file:

```json
{
	"red": "#c33",
	"bee-yellow": "#fdfd00"
}
```

will be imported as scss:

```scss
$colors: (
	red: #c33,
	beeYellow: #fdfd00,
);
```

In the scss map above `red` is a color, while `beeYellow` is a string.

`stringifyKeys: true` can be used to stringify all keys in a map.

When `stringifyKeys: true`, the following scss map will be imported for the json example from above:

```scss
$colors: (
	'red': #c33,
	'beeYellow': #fdfd00,
);
```

## Acknowledgements

This module is based on the original [node-sass-json-importer](https://www.npmjs.com/package/node-sass-json-importer) and the [sass-json-importer](https://github.com/neild3r/sass-json-importer). Unfortunately, neither handles WordPress's theme.json file correctly.
