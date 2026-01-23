import {describe, it, expect} from 'vitest';
import {
  extractAllKeys,
  findTranslationUsages,
  removeKey,
  calculateUnusedAndMissingKeys,
} from '../src/lib/unused.js';

describe('unused lib', () => {
  describe('extractAllKeys', () => {
    it('should extract flat keys', () => {
      const obj = {key1: 'value1', key2: 'value2'};
      expect(extractAllKeys(obj)).toEqual(['key1', 'key2']);
    });

    it('should extract nested keys', () => {
      const obj = {
        common: {
          title: 'Title',
          button: {
            save: 'Save',
          },
        },
        home: 'Home',
      };
      expect(extractAllKeys(obj)).toEqual(['common.title', 'common.button.save', 'home']);
    });
  });

  describe('calculateUnusedAndMissingKeys', () => {
    it('should match unused and missing keys correctly', () => {
      const allKeys = ['common.ok', 'home.title', 'unused.key'];
      const usedKeys = new Set(['common.ok', 'missing.key']);
      const excluded = ['ignore.'];

      const result = calculateUnusedAndMissingKeys(allKeys, usedKeys, excluded);

      expect(result.unusedKeys).toContain('unused.key');
      expect(result.unusedKeys).not.toContain('common.ok');
      expect(result.unusedKeys).toContain('home.title');

      expect(result.missingKeys).toContain('missing.key');
      expect(result.missingKeys).not.toContain('common.ok');
    });

    it('should handle parent keys correctly', () => {
      // defined in json: { group: { item: 1 } } -> allKeys: ['group.item']
      // used in code: t('group') -> usedKeys: ['group']

      const allKeys = ['group.item'];
      const usedKeys = new Set(['group']);

      const result = calculateUnusedAndMissingKeys(allKeys, usedKeys, []);

      // group.item is technically NOT unused if group is used?
      // Current logic:
      // Check parent objects for dynamic usage:
      // if key (group.item) startsWith(usedKey (group) + '.') -> return false (not unused)
      expect(result.unusedKeys).not.toContain('group.item');

      // Missing keys logic:
      // group is used. is it missing?
      // existingKey (group.item) passed check startsWith(key (group) + '.')
      // so it returns false (not missing).
      expect(result.missingKeys).not.toContain('group');
    });
  });

  describe('findTranslationUsages', () => {
    it('should find single quote usage', () => {
      const content = `const t = useTranslation(); t('key1');`;
      expect(findTranslationUsages(content)).toContain('key1');
    });

    it('should find double quote usage', () => {
      const content = `t("key2")`;
      expect(findTranslationUsages(content)).toContain('key2');
    });

    it('should find template literal usage', () => {
      const content = 't(`key3`)';
      expect(findTranslationUsages(content)).toContain('key3');
    });

    it('should extract dynamic template literal base path', () => {
      // user case: tracker.freq.${var} -> tracker.freq
      const content = 't(`tracker.freq.${freq}`)';
      expect(findTranslationUsages(content)).toContain('tracker.freq');
    });

    it('should find usage in Alert.alert', () => {
      const content =
        "Alert.alert(t('common.error'), t('login.errors.emailVerificationNotAvailable'));";
      const result = findTranslationUsages(content);
      expect(result).toContain('common.error');
      expect(result).toContain('login.errors.emailVerificationNotAvailable');
    });

    it('should ignore short or invalid keys', () => {
      expect(findTranslationUsages("t('a')")).not.toContain('a');
      expect(findTranslationUsages("t('')")).not.toContain('');
    });
  });

  describe('removeKey', () => {
    it('should remove a simple key', () => {
      const obj = {a: 1, b: 2};
      expect(removeKey(obj, 'a')).toBe(true);
      expect(obj).toEqual({b: 2});
    });

    it('should remove a nested key', () => {
      const obj = {a: {b: {c: 3}}, d: 4};
      expect(removeKey(obj, 'a.b.c')).toBe(true);
      expect(obj).toEqual({a: {b: {}}, d: 4});
    });

    it('should return false if key does not exist', () => {
      const obj = {a: 1};
      expect(removeKey(obj, 'b')).toBe(false);
      expect(obj).toEqual({a: 1});
    });

    it('should return false if path does not exist', () => {
      const obj = {a: 1};
      expect(removeKey(obj, 'a.b.c')).toBe(false);
    });
  });
});
