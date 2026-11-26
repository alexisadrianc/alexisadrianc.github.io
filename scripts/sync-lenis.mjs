import {copyFile, mkdir} from 'node:fs/promises';
const source = new URL('../node_modules/lenis/', import.meta.url);
const destination = new URL('../assets/vendor/', import.meta.url);
await mkdir(destination, {recursive:true});
for (const [input, output] of [['dist/lenis.mjs','lenis.js'],['dist/lenis.css','lenis.css'],['LICENSE','lenis-LICENSE.txt']]) {
  await copyFile(new URL(input, source), new URL(output, destination));
}
console.log('Lenis: módulo, CSS y licencia sincronizados en assets/vendor.');
