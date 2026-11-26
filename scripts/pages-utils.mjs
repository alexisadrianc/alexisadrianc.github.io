import {readdir,lstat,readFile} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import http from 'node:http';

export const root=fileURLToPath(new URL('../',import.meta.url));
export const output=resolve(root,'dist');
export const config=JSON.parse(await readFile(new URL('../pages.config.json',import.meta.url),'utf8'));

export function normalizeBase(value){
  if(value===''||value==='/') return '/';
  const segments=value.replace(/^\/+|\/+$/g,'').split('/');
  if(segments.some(part=>!part||part==='.'||part==='..'||! /^[\w.-]+$/.test(part))) throw Error('Invalid Pages base path');
  return '/'+segments.join('/')+'/';
}
export function deploymentBase(env=process.env){
  if(env.PAGES_BASE_PATH!==undefined) return normalizeBase(env.PAGES_BASE_PATH);
  if(!env.GITHUB_REPOSITORY&&config.basePath!==undefined) return normalizeBase(config.basePath);
  const repository=env.GITHUB_REPOSITORY||config.repository;
  if(!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw Error('Invalid owner/repository');
  const [owner,name]=repository.split('/');
  return name.toLowerCase()===`${owner.toLowerCase()}.github.io`?'/':normalizeBase(name);
}
export async function filesIn(directory,prefix=''){
  const files=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const relative=prefix+entry.name;
    if(entry.isSymbolicLink()) throw Error(`Symbolic link not allowed: ${relative}`);
    if(entry.isDirectory()) files.push(...await filesIn(join(directory,entry.name),relative+'/'));
    else if(entry.isFile()) files.push(relative);
    else throw Error(`Unsupported file: ${relative}`);
  }
  return files.sort();
}
export const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json','.txt':'text/plain; charset=utf-8'};

export async function productionServer(){
  const html=await readFile(join(output,'index.html'),'utf8');
  const base=html.match(/<base href="([^"]+)">/)?.[1];
  if(!base) throw Error('Run npm run build first');
  const files=new Set(await filesIn(output));
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://preview.invalid');
      if(base!=='/'&&url.pathname===base.slice(0,-1)){res.writeHead(308,{Location:base+url.search}).end();return;}
      if(!url.pathname.startsWith(base)){res.writeHead(404).end();return;}
      const relative=decodeURIComponent(url.pathname.slice(base.length))||'index.html';
      if(!files.has(relative)){res.writeHead(404).end();return;}
      const path=resolve(output,relative);
      if(!path.startsWith(output+sep)||(await lstat(path)).isSymbolicLink()){res.writeHead(403).end();return;}
      res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(path));
    }catch{res.writeHead(404).end();}
  });
  return {server,base,files,html};
}
