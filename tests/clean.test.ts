import {describe, it, expect} from 'vitest';
import {removeEmptyObjects, hasEmptyObjects} from '../src/lib/clean.js';

describe('clean lib', () => {
  describe('hasEmptyObjects', () => {
    it('should return false for simple object', () => {
      expect(hasEmptyObjects({a: 1})).toBe(false);
    });

    it('should return true for empty object nested', () => {
      expect(hasEmptyObjects({a: {}})).toBe(true);
    });

    it('should return true for deep empty object', () => {
      expect(hasEmptyObjects({a: {b: {}}})).toBe(true);
    });

    it('should return false for non-empty nested', () => {
      expect(hasEmptyObjects({a: {b: 1}})).toBe(false);
    });
  });

  describe('removeEmptyObjects', () => {
    it('should return clean object as is', () => {
      const obj = {a: 1};
      expect(removeEmptyObjects(obj)).toEqual({a: 1});
    });

    it('should remove direct empty object', () => {
      const obj = {a: 1, b: {}};
      expect(removeEmptyObjects(obj)).toEqual({a: 1});
    });

    it('should remove deep empty object', () => {
      const obj = {a: 1, b: {c: {}}};
      // After removing c, b becomes empty, so b should also be removed?
      // The recursive implementation does `removeEmptyObjects(obj[key])` first, then checks length.
      // So if c is removed, b becomes empty, so b should be removed too.
      expect(removeEmptyObjects(obj)).toEqual({a: 1});
    });

    it('should keep arrays', () => {
      const obj = {a: []};
      expect(removeEmptyObjects(obj)).toEqual({a: []});
    });

    it('should handle cleaning when siblings exist', () => {
      const obj = {valid: 'val', nested: {empty: {}, persistent: 'val'}};
      expect(removeEmptyObjects(obj)).toEqual({
        valid: 'val',
        nested: {persistent: 'val'},
      });
    });
  });
});
