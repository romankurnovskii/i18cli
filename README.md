# i18cli

Translation cleanup and maintenance tools for i18next projects. This CLI helps you maintain clean translation files by identifying and removing unused keys, cleaning empty objects, fixing stringified JSON values, and merging translations.

## Use Cases

Use this tool if you want to find unused keys and clean them up automatically.

**Example 1: Find unused keys in your project**

```bash
npx i18cli list-unused
```

Output:

```
📖 Loading base translation file: en.json
   (default fallback, set EXPO_PUBLIC_DEFAULT_LOCALE to override)

🔍 Scanning TSX files for translation usage...

   Found 32 TSX files
   Found 56 unique translation keys in use

❌ Found 10 unused translation key(s) in en.json:

   These keys are not used in any TSX files and can be removed:

   Key: auth.login_button_old
   Value: Sign In (Legacy)
   → Remove from en.json and all other locale files

   Key: common.unused_label
   Value: Unused Label
   → Remove from en.json and all other locale files
```

**Example 2: Remove unused keys (and fix test failures)**

Removes unused keys from all locale files. Use this command if you want to clean up your translation files or if your tests (e.g. `translations-usage.test.ts`) are failing due to unused keys.

```bash
npx i18cli remove-unused
```

Output:

```
📖 Loading base translation file: en.json

🔍 Scanning source files...

🗑️  Found 10 unused key(s) to remove

📝 Processing 10 locale files...
   ...
✅ Done! Removed 250 key(s) total from 26 locale file(s).
```

## Installation

```bash
npm install i18cli --save-dev
# or
yarn add -D i18cli
# or
pnpm add -D i18cli
```

## Usage

Run the tool using `npx i18cli` or just `i18cli` if installed globally/linked.

```bash
npx i18cli --help
```

### Commands

#### 1. List Unused Keys

Scans your `app/` directory (customizable) for translation usage and compares it against your default locale file.

```bash
npx i18cli list-unused
```

**Options:**

- `-l, --locales-dir <path>`: Path to locales directory (default: `./locales`)
- `-s, --source-dir <path>`: Path to source code directory (default: `.`)
- `-d, --default-locale <locale>`: Default locale (default: `en`)
- `--json`: Output result as JSON

#### 2. Remove Unused Keys

Removes keys identified as unused from **all** locale files.

```bash
npx i18cli remove-unused
```

_Note: Use `--dry-run` to see what would be removed without modifying files._

#### 3. Clean Empty Objects

Recursively removes empty objects from your locale files (often left behind after removing keys).

```bash
npx i18cli clean-empty
```

#### 4. Fix Stringified JSON

Fixes values that have been accidentally stringified (e.g., `"{ \"key\": \"value\" }"` -> `{"key": "value"}`).

```bash
npx i18cli fix-json
```

_Note: Use `--dry-run` to preview changes._

#### 5. Merge Translations

Deep merges translations from a source file (default: `_locales_to_merge.json` in locales dir) into your locale files.

```bash
npx i18cli merge
```

**Options:**

- `-m, --merge-file <filename>`: Filename of the merge source (default: `_locales_to_merge.json`)

## Configuration

You can configure the tool using a config file, environment variables, or CLI flags.

### Config File

Create `i18n-tools.config.js` (or `.json`, `.cjs`, `.mjs`) in your project root:

```js
module.exports = {
  localesDir: './src/locales',
  sourceDir: './src', // default is '.'
  defaultLocale: 'en',
  excludedKeyPrefixes: ['common.', 'metadata.'],
};
```

### Environment Variables

- `I18N_LOCALES_DIR` or `EXPO_PUBLIC_LOCALE_DIR`
- `I18N_SOURCE_DIR`
- `I18N_DEFAULT_LOCALE` or `EXPO_PUBLIC_DEFAULT_LOCALE`

## Programmatic API

You can import core functions to use in your own scripts:

```ts
import {findUnusedKeys, removeUnusedKeys} from 'i18cli';
// or
const {cleanEmptyObjects} = require('i18cli');
```

## License

MIT
