import fs from 'fs';
import path from 'path';
import type {I18nConfig} from '../config.js';

export function recursiveUpdate(source: any, target: any): boolean {
  let updated = false;
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];

      if (target[key] === undefined) {
        target[key] = value;
        updated = true;
      } else if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        if (recursiveUpdate(value, target[key])) {
          updated = true;
        }
      } else if (JSON.stringify(target[key]) !== JSON.stringify(value)) {
        target[key] = value;
        updated = true;
      }
    }
  }
  return updated;
}

export async function mergeTranslations(
  config: I18nConfig,
  mergeFileStr: string = '_locales_to_merge.json',
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  const mergeFilePath = path.join(config.localesDir, mergeFileStr);

  if (!fs.existsSync(mergeFilePath)) {
    throw new Error(`Merge file not found: ${mergeFilePath}`);
  }

  const mergeData = JSON.parse(fs.readFileSync(mergeFilePath, 'utf-8'));

  for (const locale in mergeData) {
    if (Object.prototype.hasOwnProperty.call(mergeData, locale)) {
      const dataToMerge = mergeData[locale];
      const targetFilePath = path.join(config.localesDir, `${locale}.json`);

      if (!fs.existsSync(targetFilePath)) {
        console.warn(`⚠️  Warning: Locale file ${locale}.json not found. Skipping.`);
        results.set(locale, false); // or false?
        continue;
      }

      const targetData = JSON.parse(fs.readFileSync(targetFilePath, 'utf-8'));

      if (recursiveUpdate(dataToMerge, targetData)) {
        fs.writeFileSync(targetFilePath, JSON.stringify(targetData, null, 2) + '\n');
        results.set(locale, true);
      } else {
        results.set(locale, false);
      }
    }
  }

  return results;
}
