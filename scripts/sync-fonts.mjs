import {copyFile, mkdir} from 'node:fs/promises';
const destination = new URL('../assets/fonts/', import.meta.url);
await mkdir(destination, {recursive:true});
for (const family of ['poppins','geist-mono','geist']) {
  const source = new URL(`../node_modules/@fontsource/${family}/`, import.meta.url);
  for (const weight of family==='geist'?[500]:[400,500]) {
    const filename = `${family}-latin-${weight}-normal.woff2`;
    await copyFile(new URL(`files/${filename}`,source), new URL(filename,destination));
  }
  await copyFile(new URL('LICENSE',source),new URL(`${family}-LICENSE.txt`,destination));
}
console.log('Poppins/Geist Mono 400–500 y Geist 500: fuentes y licencias sincronizadas.');
