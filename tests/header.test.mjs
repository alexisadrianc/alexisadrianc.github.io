import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {translateText,monthLabels} from '../i18n.js';
import {translations,translationRows} from '../translations.js';
import {content,supportedLocales} from '../content.js';
import {initHeaderControls} from '../header-controls.js';

test('antes del primer paint se respeta la preferencia válida o el tema del sistema',()=>{
  const code=readFileSync(new URL('../theme-init.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.indexOf('src="theme-init.js"')<html.indexOf('rel="stylesheet"'));
  for(const [saved,system,expected] of [[null,true,'dark'],['light',true,'light'],['dark',false,'dark'],['invalid',false,'light']]){
    const doc={documentElement:{dataset:{},style:{}}};
    vm.runInNewContext(code,{document:doc,window:{},localStorage:{getItem:key=>key==='ac-theme'?saved:'fr'},matchMedia:()=>({matches:system})});
    assert.equal(doc.documentElement.dataset.theme,expected);assert.equal(doc.documentElement.lang,'fr');
    assert.equal(doc.documentElement.style.colorScheme,expected);
  }
  const doc={documentElement:{dataset:{},style:{}}};
  vm.runInNewContext(code,{document:doc,window:{},localStorage:{getItem:()=>{throw new Error('blocked');}},matchMedia:()=>({matches:true})});
  assert.equal(doc.documentElement.dataset.theme,'dark');assert.equal(doc.documentElement.lang,'en');
  for(const savedLanguage of [null,'invalid','es','fr','en']){
    const initial={documentElement:{dataset:{},style:{}}};
    vm.runInNewContext(code,{document:initial,window:{},localStorage:{getItem:key=>key==='ac-language'?savedLanguage:null},matchMedia:()=>({matches:false})});
    assert.equal(initial.documentElement.lang,['es','fr','en'].includes(savedLanguage)?savedLanguage:'en');
  }
});
test('el catálogo ofrece EN/FR para toda la narrativa y las demos canónicas',()=>{
  assert.equal(Object.keys(translations).length,translationRows.length,'No duplicate source keys');
  assert.deepEqual(supportedLocales,['es','en','fr']);
  for(const [es,en,fr] of translationRows){assert.ok(es&&en&&fr);assert.equal(translateText(es,'en'),en);assert.equal(translateText(es,'fr'),fr);}
  for(const locale of ['en','fr']){
    for(const problem of content.es.problems) for(const field of ['title','label','heading','description']) assert.notEqual(translateText(problem[field],locale),problem[field]);
    for(const [index,row] of content.es.experience.entries()) assert.notEqual(content[locale].experience[index][2],row[2]);
  }
});
test('las etiquetas de resultados, notas y descripciones accesibles también se traducen',()=>{
  assert.equal(translateText('Resultado de marzo','en'),'Result for March');
  assert.equal(translateText('Resultado de marzo','fr'),'Résultat de mars');
  assert.deepEqual(monthLabels('fr'),['Janvier','Février','Mars','Avril','Mai','Juin']);
  const note='Datos ficticios · Marzo: ingresos 21.000 − gastos 16.000 = 5000 CAD. Acumulado: suma de resultados desde enero.';
  assert.match(translateText(note,'en'),/^Fictitious data · March:/);
  assert.match(translateText(note,'fr'),/^Données fictives · Mars/);
  assert.equal(translateText(' El software debe ','en'),' Software should ');
});

function setup(t){
  class Element extends EventTarget{
    constructor(data={}){super();this.dataset=data;this.attributes={};this.children=[];this.hidden=true;}
    setAttribute(key,value){this.attributes[key]=value;}
    focus(){doc.activeElement=this;}
    contains(target){return target===this||this.children.some(child=>child.contains(target));}
  }
  const doc=Object.assign(new EventTarget(),{documentElement:{dataset:{},style:{}}});
  const themeToggle=new Element();
  const trigger=new Element(),menu=new Element(),code=new Element(),control=new Element();
  const options=['en','fr','es'].map(language=>new Element({language}));menu.children=options;control.children=[trigger,menu];
  menu.querySelectorAll=()=>options;
  const root={querySelector:()=>control};const meta={};
  doc.querySelector=selector=>selector==='.header-controls'?root:meta;
  doc.getElementById=id=>({'theme-toggle':themeToggle,'language-toggle':trigger,'language-menu':menu,'language-current':code})[id];
  const system=Object.assign(new EventTarget(),{matches:true});const stored={};
  const win={matchMedia:()=>system,localStorage:{setItem:(key,value)=>{stored[key]=value;}}};
  const abort=new AbortController();t.after(()=>abort.abort());let selected;
  initHeaderControls({doc,win,signal:abort.signal,setLocale:locale=>{selected=locale;}});
  return {doc,themeToggle,trigger,menu,options,stored,system,meta,get selected(){return selected;}};
}
test('un único botón indica el destino, alterna el tema y conserva la preferencia',t=>{
  const env=setup(t);assert.equal(env.doc.documentElement.dataset.theme,'dark');
  assert.equal(env.themeToggle.attributes['aria-label'],'Activar tema claro');
  env.themeToggle.dispatchEvent(new Event('click'));assert.equal(env.stored['ac-theme'],'light');
  assert.equal(env.themeToggle.attributes['aria-label'],'Activar tema oscuro');
  env.system.dispatchEvent(new Event('change'));assert.equal(env.doc.documentElement.dataset.theme,'light');
  env.themeToggle.dispatchEvent(new Event('click'));assert.equal(env.stored['ac-theme'],'dark');
  assert.equal(env.themeToggle.attributes['aria-label'],'Activar tema claro');
});
test('el selector permite teclado y selección; Escape devuelve foco al globo',t=>{
  const env=setup(t);env.trigger.dispatchEvent(new Event('click'));assert.equal(env.menu.hidden,false);assert.equal(env.doc.activeElement,env.options[2]);
  const arrow=new Event('keydown',{cancelable:true});Object.defineProperty(arrow,'key',{value:'ArrowDown'});env.menu.dispatchEvent(arrow);
  assert.equal(env.doc.activeElement,env.options[0]);env.options[0].dispatchEvent(new Event('click'));
  assert.equal(env.selected,'en');assert.equal(env.menu.hidden,true);assert.equal(env.doc.activeElement,env.trigger);
  env.trigger.dispatchEvent(new Event('click'));
  const escape=new Event('keydown',{cancelable:true});Object.defineProperty(escape,'key',{value:'Escape'});env.doc.dispatchEvent(escape);
  assert.equal(env.menu.hidden,true);assert.equal(escape.defaultPrevented,true);assert.equal(env.doc.activeElement,env.trigger);
});
test('un clic fuera cierra el selector',t=>{
  const env=setup(t);env.trigger.dispatchEvent(new Event('click'));env.doc.dispatchEvent(new Event('click'));
  assert.equal(env.menu.hidden,true);assert.equal(env.trigger.attributes['aria-expanded'],'false');
});
