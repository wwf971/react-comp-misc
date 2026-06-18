import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const buildDir = resolve('build');

await copyFile(resolve(buildDir, 'index.html'), resolve(buildDir, '404.html'));
