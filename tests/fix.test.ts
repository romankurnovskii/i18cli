import {describe, it, expect} from 'vitest';
import {fixNestedJson} from '../src/lib/fix.js';

describe('fix lib', () => {
  describe('fixNestedJson', () => {
    it('should leave simple string alone', () => {
      expect(fixNestedJson('simple')).toBe('simple');
    });

    it('should fix stringified object', () => {
      const input = '{"key": "value"}';
      expect(fixNestedJson(input)).toEqual({key: 'value'});
    });

    it('should fix stringified array', () => {
      const input = '[1, 2, 3]';
      expect(fixNestedJson(input)).toEqual([1, 2, 3]);
    });

    it('should fix nested stringified object', () => {
      const input = {
        level1: '{"level2": "value"}',
      };
      expect(fixNestedJson(input)).toEqual({
        level1: {level2: 'value'},
      });
    });

    it('should fix deep nested stringified data', () => {
      const input = {
        a: {
          b: '{"c": "[1, 2]"}',
        },
      };
      // Recursive fix?
      // The python script was recursive. Let's check our implementation.
      // Our TS check:
      // if object -> recurse
      // if string -> parse -> recurse
      // So yes, it should handle it.

      // "c" value parses to "[1, 2]" string first?
      // Wait, JSON.parse('{"c": "[1, 2]"}') -> { c: "[1, 2]" }
      // Then recursive call on value "[1, 2]" -> [1, 2]

      expect(fixNestedJson(input)).toEqual({
        a: {
          b: {c: [1, 2]},
        },
      });
    });

    it('should handle invalid json simply as string', () => {
      const input = '{invalid key}';
      expect(fixNestedJson(input)).toBe('{invalid key}');
    });
  });
});
