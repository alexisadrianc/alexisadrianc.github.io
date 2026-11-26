import {mkdir,writeFile} from 'node:fs/promises';
const destination=new URL('../assets/tech/',import.meta.url);
await mkdir(destination,{recursive:true});
const sources={
  'python.svg':'https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg',
  'odoo.svg':'https://raw.githubusercontent.com/odoo/odoo/19.0/addons/web/static/img/odoo_logo.svg',
  'postgresql.png':'https://www.postgresql.org/media/img/about/press/elephant.png',
  'javascript.svg':'https://raw.githubusercontent.com/voodootikigod/logo.js/master/js.svg',
  'django.svg':'https://www.djangoproject.com/m/img/logos/django-logo-positive.svg',
  'docker.svg':'https://www.docker.com/app/uploads/brand/logo/docker-mark-ether.svg',
  'git.svg':'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg',
  'html.svg':'https://www.w3.org/html/logo/downloads/HTML5_Badge.svg',
  'css.svg':'https://raw.githubusercontent.com/CSS-Next/logo.css/main/css.svg',
};
const results=await Promise.allSettled(Object.entries(sources).map(async([name,url])=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(name.endsWith('.svg')&&!bytes.toString().includes('<svg')) throw new Error(`${name}: invalid SVG`);
  await writeFile(new URL(name,destination),bytes);
  return `${name}: ${bytes.length} bytes`;
}));
for(const result of results) console.log(result.status==='fulfilled'?result.value:result.reason.message);
await writeFile(new URL('sources.json',destination),JSON.stringify(sources,null,2)+'\n');
