import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {once} from 'node:events';
import {productionServer,output,root,normalizeBase,deploymentBase,mime} from './pages-utils.mjs';

assert.equal(normalizeBase('/portfolio'),'/portfolio/');
assert.equal(deploymentBase({}),'/');
assert.equal(deploymentBase({GITHUB_REPOSITORY:'alexisadrianc/alexisadrianc.github.io'}),'/');
assert.equal(deploymentBase({GITHUB_REPOSITORY:'example/example.github.io'}),'/');
assert.equal(deploymentBase({GITHUB_REPOSITORY:'example/portfolio'}),'/portfolio/');
assert.equal(deploymentBase({PAGES_BASE_PATH:''}),'/');
for(const invalid of ['../private','https://example.com','/a/../b','/a%2fb']) assert.throws(()=>normalizeBase(invalid));

const {server,base,files,html}=await productionServer();
assert.equal(normalizeBase(base),base);
const suspicious=[
  ['local address',/\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i],
  ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token',/\b(?:gh[pousr]_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{40,})\b/],
  ['AWS access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['credential assignment',/\b(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*["'][^"'\s]{12,}["']/i],
  ['private URL',/https?:\/\/(?:[^/\s"']+@|[^/\s"']*\.(?:internal|local)(?:[/:]|$))/i],
];
const checks=[];
const documentURL=new URL(`https://pages.example${base}`);
function reference(value,from){
  if(!value||value.startsWith('data:')||value.startsWith('mailto:')) return;
  const url=new URL(value,from==='index.html'?documentURL:new URL(from,documentURL));
  if(url.origin!==documentURL.origin){
    // External social links are allowed; executable resources must be local.
    assert.ok(from==='index.html'&&/^https:\/\/(?:www\.linkedin\.com|github\.com)\//.test(url.href),`External resource in ${from}`);
    return;
  }
  assert.ok(url.pathname.startsWith(base),`Reference escapes Pages base in ${from}`);
  const file=decodeURIComponent(url.pathname.slice(base.length))||'index.html';
  assert.ok(files.has(file),`Missing resource (case-sensitive): ${from} -> ${file}`);
  if(file==='index.html'&&url.hash) assert.ok(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`Missing anchor in ${from}`);
  checks.push(url.pathname+url.search);
}
for(const file of files){
  assert.ok(!/(?:^|\/)(?:node_modules|\.git|\.env|server\.mjs|tests|scripts)(?:\/|$)/.test(file),`Development file published: ${file}`);
  if(!/\.(?:html|css|js|svg|json|txt|md)$/.test(file)) continue;
  const source=await readFile(join(output,file),'utf8');
  for(const [name,pattern] of suspicious) assert.ok(!pattern.test(source),`${name} detected in ${file}; inspect locally`);
  if(file==='index.html'){
    for(const match of source.matchAll(/\b(?:src|href)="([^"]+)"/g)) reference(match[1],file);
  }else if(file.endsWith('.css')){
    for(const match of source.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) reference(match[1],file);
  }else if(file.endsWith('.js')&&!file.startsWith('assets/vendor/')){
    assert.ok(!/\b(?:fetch|WebSocket|XMLHttpRequest)\s*\(/.test(source),`Backend dependency in ${file}`);
    for(const match of source.matchAll(/['"]((?:\.\.?\/|assets\/)[^'"\r\n]+\.(?:js|css|svg|png|pdf|woff2|ttf))['"]/g)) reference(match[1],file);
  }else if(file.endsWith('.svg')){
    for(const match of source.matchAll(/\b(?:href|xlink:href)="([^"]+)"/g)) if(!match[1].startsWith('#')) reference(match[1],file);
  }
}
// All supplied resources must survive packaging unchanged (except removed map comments).
const {filesIn}=await import('./pages-utils.mjs');
for(const asset of await filesIn(join(root,'assets'))){
  assert.ok(files.has('assets/'+asset),`Asset omitted: ${asset}`);
  if(!['vendor/lenis.js','vendor/chart.js'].includes(asset)) assert.deepEqual(await readFile(join(output,'assets',asset)),await readFile(join(root,'assets',asset)),`Asset modified: ${asset}`);
}
server.listen(0,'127.0.0.1');
await once(server,'listening');
const origin=`http://127.0.0.1:${server.address().port}`;
try{
  for(const file of files){
    const response=await fetch(origin+base+file);
    assert.equal(response.status,200,`HTTP failure: ${file}`);
    if(mime[extname(file)]) assert.equal(response.headers.get('content-type'),mime[extname(file)],`Wrong MIME: ${file}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(join(output,file)),`HTTP body mismatch: ${file}`);
  }
  for(const path of new Set(checks)) assert.equal((await fetch(origin+path)).status,200,`Navigation failure: ${path}`);
  if(base!=='/'){
    assert.equal((await fetch(origin+'/app.js')).status,404,'Root fallback hides broken base paths');
    const redirect=await fetch(origin+base.slice(0,-1),{redirect:'manual'});
    assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),base);
  }
  assert.equal((await fetch(origin+base+'missing-file.js')).status,404);
  console.log(`Production verified: ${files.size} files, ${new Set(checks).size} resource/navigation paths at ${base}; no detected credentials, local addresses or backend calls.`);
}finally{
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
