import path from 'path';
import fs from 'fs';
import {pathToFileURL} from 'url';

export interface I18nConfig {
  localesDir: string;
  sourceDir: string;
  defaultLocale: string;
  excludedKeyPrefixes: string[];
}

export const DEFAULT_CONFIG: I18nConfig = {
  localesDir: './locales',
  sourceDir: '.',
  defaultLocale: 'en',
  excludedKeyPrefixes: ['common.'],
};

export async function loadConfig(options: Partial<I18nConfig> = {}): Promise<I18nConfig> {
  const fileConfig = await loadConfigFile();

  const envConfig: Partial<I18nConfig> = {
    defaultLocale:
      process.env.I18N_DEFAULT_LOCALE || process.env.EXPO_PUBLIC_DEFAULT_LOCALE,
    localesDir: process.env.I18N_LOCALES_DIR,
    sourceDir: process.env.I18N_SOURCE_DIR,
  };

  // Remove undefined env values
  Object.keys(envConfig).forEach(key => {
    if (envConfig[key as keyof I18nConfig] === undefined) {
      delete envConfig[key as keyof I18nConfig];
    }
  });

  // Remove undefined options values
  Object.keys(options).forEach(key => {
    if (options[key as keyof I18nConfig] === undefined) {
      delete options[key as keyof I18nConfig];
    }
  });

  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envConfig,
    ...options,
  };

  // Resolve paths relative to CWD
  finalConfig.localesDir = path.resolve(process.cwd(), finalConfig.localesDir);
  finalConfig.sourceDir = path.resolve(process.cwd(), finalConfig.sourceDir);

  return finalConfig;
}

async function loadConfigFile(): Promise<Partial<I18nConfig>> {
  const configNames = [
    'i18n-tools.config.js',
    'i18n-tools.config.mjs',
    'i18n-tools.config.cjs',
    'i18n-tools.config.json',
  ];

  for (const name of configNames) {
    const configPath = path.resolve(process.cwd(), name);
    if (fs.existsSync(configPath)) {
      try {
        if (name.endsWith('.json')) {
          const content = fs.readFileSync(configPath, 'utf-8');
          return JSON.parse(content);
        } else {
          // Import using file URL for ESM support
          const module = await import(pathToFileURL(configPath).toString());
          return module.default || module;
        }
      } catch (error) {
        console.warn(`⚠️  Error loading config file ${name}:`, error);
      }
    }
  }

  return {};
}
