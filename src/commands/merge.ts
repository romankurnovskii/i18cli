import {Command} from 'commander';
import {loadConfig} from '../config.js';
import {mergeTranslations} from '../lib/merge.js';

export const mergeCommand = new Command('merge')
  .description('Deep merge translations from a source file into locale files')
  .option('-l, --locales-dir <path>', 'Locales directory')
  .option(
    '-m, --merge-file <filename>',
    'Filename of the merge source (default: _locales_to_merge.json)',
  )
  .action(async options => {
    try {
      const config = await loadConfig({
        localesDir: options.localesDir,
      });

      const mergeFile = options.mergeFile || '_locales_to_merge.json';

      console.log(`📂 Locales Directory: ${config.localesDir}`);
      console.log(`📖 Reading merge file: ${mergeFile}\n`);

      const results = await mergeTranslations(config, mergeFile);
      let updatedCount = 0;

      results.forEach((updated, locale) => {
        if (updated) {
          console.log(`✅ Updated ${locale}.json`);
          updatedCount++;
        } else {
          console.log(`   No changes for ${locale}.json`);
        }
      });

      console.log(`\n🎉 Done. Updated ${updatedCount} file(s).`);
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });
