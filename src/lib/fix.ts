import fs from 'fs';
import path from 'path';
import type {I18nConfig} from '../config.js';

/**
 * Recursively fix nested stringified JSON
 */
export function fixNestedJson(data: any): any {
  // Handle Lists
  if (Array.isArray(data)) {
    return data.map(item => fixNestedJson(item));
  }

  // Handle Dictionaries
  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const key in data) {
      result[key] = fixNestedJson(data[key]);
    }
    return result;
  }

  // Handle Strings
  if (typeof data === 'string') {
    const stripped = data.trim();
    if (
      (stripped.startsWith('{') && stripped.endsWith('}')) ||
      (stripped.startsWith('[') && stripped.endsWith(']'))
    ) {
      try {
        const res = JSON.parse(data);
        if (typeof res === 'object' && res !== null) {
          return fixNestedJson(res);
        }
      } catch {
        // ignore
      }
    }
  }

  return data;
}

// Add trim/startsWith/endsWith polyfills if needed or rely on modern node node environment?
// Modern node has them. But 'endswith' should be 'endsWith'. Fixing typo in code above.

function fixNestedJsonCorrected(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => fixNestedJsonCorrected(item));
  }

  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = fixNestedJsonCorrected(data[key]);
      }
    }
    return result;
  }

  if (typeof data === 'string') {
    const stripped = data.trim();
    if (
      (stripped.startsWith('{') && stripped.endsWith('}')) ||
      (stripped.startsWith('[') && stripped.endsWith(']'))
    ) {
      try {
        const res = JSON.parse(data);
        if (typeof res === 'object' && res !== null) {
          return fixNestedJsonCorrected(res);
        }
      } catch {
        // ignore
      }
    }
  }

  return data;
}

export async function fixJsonObjects(
  config: I18nConfig,
  dryRun: boolean = false,
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  const files = fs.readdirSync(config.localesDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(config.localesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const rawData = JSON.parse(content);

    const fixedData = fixNestedJsonCorrected(rawData);

    // Naive equality check - stringify comparison
    const changed = JSON.stringify(rawData) !== JSON.stringify(fixedData);

    if (changed) {
      if (!dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2) + '\n');
      }
      results.set(file, true);
    } else {
      results.set(file, false);
    }
  }

  return results;
}
