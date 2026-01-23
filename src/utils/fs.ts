import fs from 'fs';
import path from 'path';

/**
 * Recursively find files in a directory that match a specific condition
 */
export function findFilesRecursive(
  dir: string,
  condition: (file: string, stats: fs.Stats) => boolean,
  ignoreDirs: string[] = [
    'node_modules',
    '.git',
    '.expo',
    'dist',
    'build',
    'android',
    'ios',
  ],
): string[] {
  let results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        results = results.concat(findFilesRecursive(filePath, condition, ignoreDirs));
      }
    } else {
      if (condition(file, stat)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

/**
 * Get all TSX/TS/JS/JSX files in a directory
 */
export function getSourceFiles(dir: string): string[] {
  return findFilesRecursive(dir, file => {
    return /\.(tsx|ts|jsx|js)$/.test(file);
  });
}
