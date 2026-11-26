import {readFile,writeFile,mkdir,copyFile,rm,lstat} from 'node:fs/promises';
import {join,resolve,dirname,sep} from 'node:path';
import {root,output,filesIn,deploymentBase} from './pages-utils.mjs';

// Explicit publication list: no development server, tests, local tools or credentials.
const publicFiles=[
  'index.html','app.js','content.js','smooth-scroll.js','report-chart.js',
  'experience-accordion.js','demo-transition.js','hero-trail.js','i18n.js',
  'header-controls.js','theme-init.js','translations.js','integration-steps.js',
  'style.css','typography.css','brand.css','charts.css','experience.css',
  'demo-transition.css','hero-trail.css','header.css','integration-steps.css','palette.css',
];
const base=deploymentBase();
// The only removable directory is the literal dist folder inside this workspace.
if(output!==resolve(root,'dist')||!output.startsWith(resolve(root)+sep)) throw Error('Unsafe build output');
try{if((await lstat(output)).isSymbolicLink()) throw Error('dist must not be a symbolic link');}catch(error){if(error.code!=='ENOENT') throw error;}
const assets=(await filesIn(join(root,'assets'))).map(file=>'assets/'+file);
for(const file of [...publicFiles,...assets]){
  if((await lstat(join(root,file))).isSymbolicLink()) throw Error(`Symbolic link not allowed: ${file}`);
  if(/(?:^|\/)(?:\.|.*\.(?:key|pem|pfx)$)/i.test(file)) throw Error(`Private file in publication list: ${file}`);
}
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const file of [...publicFiles,...assets]){
  const destination=join(output,file);
  await mkdir(dirname(destination),{recursive:true});
  await copyFile(join(root,file),destination);
}
const html=await readFile(join(output,'index.html'),'utf8');
await writeFile(join(output,'index.html'),html.replace('<head>',`<head>\n  <base href="${base}">`));
// Source maps are not part of this release; avoid missing-map requests in DevTools.
for(const file of ['assets/vendor/lenis.js','assets/vendor/chart.js']){
  const path=join(output,file);
  await writeFile(path,(await readFile(path,'utf8')).replace(/^\/\/[#@] sourceMappingURL=.*$/gm,''));
}
await writeFile(join(output,'.nojekyll'),'');
console.log(`Static build: dist/ (${publicFiles.length+assets.length+1} files), base ${base}`);
