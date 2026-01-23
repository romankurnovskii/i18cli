import {Command} from 'commander';
import {loadConfig} from '../config.js';
import {findUnusedKeys} from '../lib/unused.js';

export const listUnusedCommand = new Command('list-unused')
  .description('List unused translation keys')
  .option('-l, --locales-dir <path>', 'Locales directory')
  .option('-s, --source-dir <path>', 'Source directory')
  .option('-d, --default-locale <locale>', 'Default locale')
  .option('--json', 'Output as JSON')
  .action(async options => {
    try {
      const config = await loadConfig({
        localesDir: options.localesDir,
        sourceDir: options.sourceDir,
        defaultLocale: options.defaultLocale,
      });

      console.log(`📖 Loading base translation file: ${config.defaultLocale}.json`);
      console.log(`🔍 Scanning source files in ${config.sourceDir}...\n`);

      const result = await findUnusedKeys(config);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`   Found ${result.totalKeys} total keys`);
      console.log(`   Found ${result.unusedCount} unused translation keys\n`);

      if (result.unusedCount === 0 && result.missingCount === 0) {
        console.log('✅ No unused or missing translation keys found!');
      }

      if (result.missingCount > 0) {
        console.log(
          `⚠️  Found ${result.missingCount} missing keys (used in code but not in JSON):`,
        );
        result.missingKeys.forEach(key => {
          console.log(`   - ${key}`);
        });
        console.log('');
        // Should we exit with error? Maybe not strict failure for unused list, but maybe yes?
        // The user's test throws Error.
        process.exitCode = 1;
      }

      if (result.unusedCount > 0) {
        console.log(
          `❌ Found ${result.unusedCount} unused keys (in JSON but not used in code):`,
        );
        result.unusedKeys.forEach(key => {
          console.log(`   - ${key}`);
        });
        process.exitCode = 1;
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });
