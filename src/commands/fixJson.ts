import {Command} from 'commander';
import {loadConfig} from '../config.js';
import {fixJsonObjects} from '../lib/fix.js';

export const fixJsonCommand = new Command('fix-json')
  .description('Fix stringified JSON objects in value fields')
  .option('-l, --locales-dir <path>', 'Locales directory')
  .option('--dry-run', 'Preview changes without modifying files')
  .action(async options => {
    try {
      const config = await loadConfig({
        localesDir: options.localesDir,
      });

      console.log(`🔧 Fixing JSON objects in ${config.localesDir}...`);
      if (options.dryRun) {
        console.log(`   (Dry Run Mode)\n`);
      } else {
        console.log(`\n`);
      }

      const results = await fixJsonObjects(config, options.dryRun);
      let fixedCount = 0;

      results.forEach((fixed, file) => {
        if (fixed) {
          const status = options.dryRun ? 'Would be fixed' : 'Fixed';
          console.log(`   ✅ ${file}: ${status}`);
          fixedCount++;
        } else {
          console.log(`   ✓ ${file}: No changes needed`);
        }
      });

      const action = options.dryRun ? 'Would fix' : 'Fixed';
      console.log(`\n${action} ${fixedCount} out of ${results.size} file(s)`);
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });
