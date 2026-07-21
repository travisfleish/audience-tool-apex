import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const distDir = join(root, 'dist');

function copyWithRetry(src, dest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const destDirPath = dirname(dest);
      if (!existsSync(destDirPath)) {
        mkdirSync(destDirPath, { recursive: true });
      }
      cpSync(src, dest, { recursive: true });
      return true;
    } catch (err) {
      if (i === retries - 1) {
        console.warn(`Warning: Could not copy ${src}: ${err.message}`);
        return false;
      }
      const delay = Math.pow(2, i) * 100;
      const start = Date.now();
      while (Date.now() - start < delay) {}
    }
  }
  return false;
}

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

try {
  cpSync(publicDir, distDir, { recursive: true });
  console.log('Public files copied successfully');
} catch (err) {
  console.warn('Bulk copy failed, trying individual files...');
  copyWithRetry(publicDir, distDir);
}
