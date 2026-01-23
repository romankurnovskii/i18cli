import {describe, it, expect, vi, afterEach} from 'vitest';
import {loadConfig} from '../src/config.js';
import path from 'path';

describe('config loader', () => {
  const cwd = process.cwd();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return default config if no options or env vars are set', async () => {
    const config = await loadConfig({});

    expect(config.defaultLocale).toBe('en');
    // sourceDir should default to '.' and resolve to CWD
    expect(config.sourceDir).toBe(cwd);
    expect(config.localesDir).toBe(path.resolve(cwd, 'locales'));
  });

  it('should allow overriding defaults via options', async () => {
    const config = await loadConfig({
      sourceDir: './src',
      defaultLocale: 'fr',
    });

    expect(config.defaultLocale).toBe('fr');
    expect(config.sourceDir).toBe(path.resolve(cwd, 'src'));
  });

  it('should prioritize options over defaults', async () => {
    const config = await loadConfig({sourceDir: './custom'});
    expect(config.sourceDir).toBe(path.resolve(cwd, 'custom'));
  });
});
