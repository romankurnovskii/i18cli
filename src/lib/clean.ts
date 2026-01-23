import fs from 'fs';
import path from 'path';
import type {I18nConfig} from '../config.js';

/**
 * Recursively remove empty objects from translation structure
 */
export function removeEmptyObjects(obj: any): any {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        removeEmptyObjects(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    }
  }
  return obj;
}

/**
 * Check if object structure has empty objects
 */
export function hasEmptyObjects(obj: any): boolean {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        if (Object.keys(obj[key]).length === 0) {
          return true;
        }
        if (hasEmptyObjects(obj[key])) {
          return true;
        }
      }
    }
  }
  return false;
}

export async function cleanEmptyObjects(
  config: I18nConfig,
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  const files = fs.readdirSync(config.localesDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(config.localesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    if (hasEmptyObjects(json)) {
      const cleaned = removeEmptyObjects(JSON.parse(JSON.stringify(json)));
      fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2) + '\n');
      results.set(file, true);
    } else {
      results.set(file, false);
    }
  }

  return results;
}
