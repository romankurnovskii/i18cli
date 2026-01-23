import {describe, it, expect} from 'vitest';
import {recursiveUpdate} from '../src/lib/merge.js';

describe('merge lib', () => {
  describe('recursiveUpdate', () => {
    it('should add new key', () => {
      const source = {newKey: 'value'};
      const target = {existing: 'old'};
      expect(recursiveUpdate(source, target)).toBe(true);
      expect(target).toEqual({existing: 'old', newKey: 'value'});
    });

    it('should update existing key', () => {
      const source = {key: 'new'};
      const target = {key: 'old'};
      expect(recursiveUpdate(source, target)).toBe(true);
      expect(target).toEqual({key: 'new'});
    });

    it('should deeply merge objects', () => {
      const source = {
        common: {
          actions: {save: 'Save New'},
        },
      };
      const target = {
        common: {
          title: 'Title',
          actions: {cancel: 'Cancel', save: 'Save Old'},
        },
      };

      expect(recursiveUpdate(source, target)).toBe(true);
      expect(target).toEqual({
        common: {
          title: 'Title',
          actions: {cancel: 'Cancel', save: 'Save New'},
        },
      });
    });

    it('should return false if no changes', () => {
      const source = {key: 'val'};
      const target = {key: 'val'};
      expect(recursiveUpdate(source, target)).toBe(false);
    });

    it('should overwrite strict mismatch types (obj vs string) if needed or just replace?', () => {
      // current logic:
      // else if (JSON.stringify(target[key]) !== JSON.stringify(value)) -> target[key] = value
      // So if type differs, stringify differs -> replace.

      const source = {key: 'string'};
      const target = {key: {nested: 'obj'}};
      expect(recursiveUpdate(source, target)).toBe(true);
      expect(target).toEqual({key: 'string'});
    });

    it('should merge nested new keys', () => {
      const source = {a: {b: 2}};
      const target = {a: {c: 3}};
      expect(recursiveUpdate(source, target)).toBe(true);
      expect(target).toEqual({a: {b: 2, c: 3}});
    });
  });
});
