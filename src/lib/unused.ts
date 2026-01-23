import fs from 'fs';
import path from 'path';
import type {I18nConfig} from '../config.js';
import {getSourceFiles} from '../utils/fs.js';

export interface UnusedKeysResult {
  unusedKeys: string[];
  missingKeys: string[];
  totalKeys: number;
  unusedCount: number;
  missingCount: number;
}

/**
 * Extract all keys from a translation object (dot notation)
 */
export function extractAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...extractAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

/**
 * Find all translation key usages in a file content
 */
export function findTranslationUsages(content: string): Set<string> {
  const usages = new Set<string>();
  const patterns = [/\bt\(['"]([^'"]+)['"]/g, /\bt\(`([^`]+)`/g];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      if (key && key.trim()) {
        const trimmedKey = key.trim();

        if (trimmedKey.includes('${')) {
          const parts = trimmedKey.split('${');
          const firstPart = parts[0];
          const basePath =
            parts.length > 0 && firstPart ? firstPart.replace(/\.$/, '') : '';
          if (basePath && basePath.length > 1 && basePath.includes('.')) {
            usages.add(basePath);
          }
          continue;
        }

        if (
          trimmedKey.length > 1 &&
          (trimmedKey.includes('.') || trimmedKey.length >= 3)
        ) {
          usages.add(trimmedKey);
        }
      }
    }
  }
  return usages;
}

export function calculateUnusedAndMissingKeys(
  allTranslationKeys: string[],
  usedKeys: Set<string>,
  excludedKeyPrefixes: string[],
): UnusedKeysResult {
  const unusedKeys = allTranslationKeys.filter(key => {
    if (usedKeys.has(key)) return false;

    // Check parent objects for dynamic usage
    for (const usedKey of usedKeys) {
      if (key.startsWith(usedKey + '.')) {
        return false;
      }
    }

    // Excluded prefixes
    if (excludedKeyPrefixes.some(prefix => key.startsWith(prefix))) {
      return false;
    }

    return true;
  });

  const missingKeys = [...usedKeys].filter(key => {
    // If exact match exists, not missing
    if (allTranslationKeys.includes(key)) return false;

    // Check availability of parents or children
    for (const existingKey of allTranslationKeys) {
      if (existingKey.startsWith(key + '.')) {
        return false;
      }
    }

    return true;
  });

  return {
    unusedKeys,
    missingKeys,
    totalKeys: allTranslationKeys.length,
    unusedCount: unusedKeys.length,
    missingCount: missingKeys.length,
  };
}

export async function findUnusedKeys(config: I18nConfig): Promise<UnusedKeysResult> {
  const defaultLocalePath = path.join(config.localesDir, `${config.defaultLocale}.json`);

  if (!fs.existsSync(defaultLocalePath)) {
    throw new Error(`Default locale file not found: ${defaultLocalePath}`);
  }

  const baseTranslation = JSON.parse(fs.readFileSync(defaultLocalePath, 'utf-8'));
  const allTranslationKeys = extractAllKeys(baseTranslation);

  const sourceFiles = getSourceFiles(config.sourceDir);
  const usedKeys = new Set<string>();

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const usages = findTranslationUsages(content);
    usages.forEach(key => usedKeys.add(key));
  }

  return calculateUnusedAndMissingKeys(
    allTranslationKeys,
    usedKeys,
    config.excludedKeyPrefixes,
  );
}

export function removeKey(obj: any, keyPath: string): boolean {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      key &&
      Object.prototype.hasOwnProperty.call(current, key) &&
      typeof current[key] === 'object'
    ) {
      current = current[key];
    } else {
      return false;
    }
  }

  const finalKey = keys[keys.length - 1];
  if (finalKey && Object.prototype.hasOwnProperty.call(current, finalKey)) {
    delete current[finalKey];
    return true;
  }

  return false;
}

export async function removeUnusedKeys(
  config: I18nConfig,
  unusedKeys: string[],
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const files = fs.readdirSync(config.localesDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(config.localesDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let count = 0;

    for (const key of unusedKeys) {
      if (removeKey(json, key)) {
        count++;
      }
    }

    // We will optionally clean empty objects here or expect the caller to do it
    // The original script did it here, so let's keep it if we can import the clean util,
    // but to avoid circular deps or complexity, let's keep it separate or duplicate simple recursive cleanup?
    // Actually, the original script calls `removeEmptyObjects` right after.
    // Let's implement basics here or export it from clean.ts and import it.

    if (count > 0) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
    }
    results.set(file, count);
  }

  return results;
}
