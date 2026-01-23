import {Command} from 'commander';
import {loadConfig} from '../config.js';
import {findUnusedKeys, removeUnusedKeys} from '../lib/unused.js';
import {cleanEmptyObjects} from '../lib/clean.js';

export const removeUnusedCommand = new Command('remove-unused')
  .description('Remove unused translation keys from all locale files')
  .option('-l, --locales-dir <path>', 'Locales directory')
  .option('-s, --source-dir <path>', 'Source directory')
  .option('-d, --default-locale <locale>', 'Default locale')
  .option(
    '--dry-run',
    "Don't actually remove keys (not fully implemented for removing yet, mostly for listing)",
  )
  .action(async options => {
    try {
      const config = await loadConfig({
        localesDir: options.localesDir,
        sourceDir: options.sourceDir,
        defaultLocale: options.defaultLocale,
      });

      console.log(`📖 Loading base translation file: ${config.defaultLocale}.json`);
      console.log(`🔍 Scanning source files...\n`);

      const result = await findUnusedKeys(config);

      if (result.unusedCount === 0) {
        console.log('✅ No unused keys found.');
        return;
      }

      console.log(`cw Found ${result.unusedCount} unused key(s) to remove`);

      if (options.dryRun) {
        console.log('🔍 Dry run - nothing removed.');
        return;
      }

      console.log(`📝 Removing keys from locale files...`);
      const removeStats = await removeUnusedKeys(config, result.unusedKeys);

      removeStats.forEach((count, file) => {
        if (count > 0) {
          console.log(`   ✓ ${file}: Removed ${count} key(s)`);
        } else {
          console.log(`   - ${file}: No keys to remove`);
        }
      });

      console.log('\n🧹 Cleaning up empty objects...');
      // Clean empty objects after removal
      const cleanStats = await cleanEmptyObjects(config);
      let cleanedCount = 0;
      cleanStats.forEach((cleaned, file) => {
        if (cleaned) {
          cleanedCount++;
          console.log(`   ✓ ${file}: Cleaned empty objects`);
        }
      });

      console.log(`\n✅ Done! Cleaned empty objects in ${cleanedCount} files.`);
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });
