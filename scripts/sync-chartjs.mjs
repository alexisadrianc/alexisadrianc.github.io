import {copyFile, mkdir} from 'node:fs/promises';
const source = new URL('../node_modules/chart.js/',import.meta.url);
const destination = new URL('../assets/vendor/',import.meta.url);
await mkdir(destination,{recursive:true});
await copyFile(new URL('dist/chart.umd.min.js',source),new URL('chart.js',destination));
await copyFile(new URL('LICENSE.md',source),new URL('chartjs-LICENSE.md',destination));
console.log('Chart.js: bundle y licencia sincronizados.');
