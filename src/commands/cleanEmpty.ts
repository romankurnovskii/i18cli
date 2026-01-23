import {Command} from 'commander';
import {loadConfig} from '../config.js';
import {cleanEmptyObjects} from '../lib/clean.js';

export const cleanEmptyCommand = new Command('clean-empty')
  .description('Recursive remove empty objects from locale files')
  .option('-l, --locales-dir <path>', 'Locales directory')
  .action(async options => {
    try {
      const config = await loadConfig({
        localesDir: options.localesDir,
      });

      console.log(`🧹 Cleaning empty objects in ${config.localesDir}...\n`);

      const results = await cleanEmptyObjects(config);
      let cleanedCount = 0;

      results.forEach((cleaned, file) => {
        if (cleaned) {
          console.log(`   ✓ ${file}: Cleaned empty objects`);
          cleanedCount++;
        } else {
          console.log(`   - ${file}: No empty objects found`);
        }
      });

      if (cleanedCount > 0) {
        console.log(`\n✅ Done! Cleaned ${cleanedCount} file(s).`);
      } else {
        console.log(`\n✅ All files are already clean.`);
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });
