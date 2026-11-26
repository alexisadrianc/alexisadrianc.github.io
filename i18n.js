import {translations} from './translations.js';
export const locales=['es','en','fr'];
let current=typeof document!=='undefined'&&locales.includes(document.documentElement.lang)?document.documentElement.lang:'es';
export const getLocale=()=>current;
export const numberFormat=value=>new Intl.NumberFormat(current,{maximumFractionDigits:0}).format(value);
const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio'];
export function monthLabels(locale=current){return months.map(month=>translations[month][locale]);}
export function translateText(source,locale=current){
  if(locale==='es') return source;
  const key=source.trim();
  let result=translations[key]?.[locale];
  const monthIndex=name=>months.findIndex(month=>month.toLowerCase()===name.toLowerCase());
  const monthName=name=>{const index=monthIndex(name);return index<0?name:monthLabels(locale)[index];};
  let match;
  if(!result&&(match=key.match(/^Resultado de (.+)$/))) result=locale==='en'?`Result for ${monthName(match[1])}`:`Résultat de ${monthName(match[1]).toLowerCase()}`;
  if(!result&&(match=key.match(/^Acumulado ene–(.+)$/))){
    const index=['ene','feb','mar','abr','may','jun'].indexOf(match[1]);
    const end=index<0?match[1]:monthLabels(locale)[index].slice(0,3);
    result=locale==='en'?`YTD Jan–${end}`:`Cumul jan–${end.toLowerCase()}`;
  }
  if(!result&&(match=key.match(/^Datos ficticios · (.+): ingresos (.+) − gastos (.+) = (.+) CAD\. Acumulado: suma de resultados desde enero\.$/))){
    result=locale==='en'?`Fictitious data · ${monthName(match[1])}: income ${match[2]} − expenses ${match[3]} = ${match[4]} CAD. Year to date: sum of results since January.`:`Données fictives · ${monthName(match[1])} : revenus ${match[2]} − dépenses ${match[3]} = ${match[4]} CAD. Cumul : somme des résultats depuis janvier.`;
  }
  if(!result&&(match=key.match(/^Resultados mensuales y acumulados de enero a (.+)\. (.+): (.+) CAD; acumulado: (.+) CAD\.$/))){
    result=locale==='en'?`Monthly and year-to-date results from January to ${monthName(match[1])}. ${monthName(match[2])}: ${match[3]} CAD; year to date: ${match[4]} CAD.`:`Résultats mensuels et cumulés de janvier à ${monthName(match[1]).toLowerCase()}. ${monthName(match[2])} : ${match[3]} CAD ; cumul : ${match[4]} CAD.`;
  }
  return result?source.replace(key,result):source;
}

export function initTranslations({signal,doc=document}={}){
  const originals=new WeakMap();
  const attributeSources=new WeakMap();
  const attributes=['aria-label','title','alt','placeholder'];
  const events=new AbortController();
  const title={es:'Alexis Cabrera — Todo empieza a conectar',en:'Alexis Cabrera — Everything starts to connect',fr:'Alexis Cabrera — Tout commence à se connecter'};
  const description=doc.querySelector('meta[name="description"]');
  const descriptionSource=description?.content;
  let observer;
  const skip=element=>element?.closest?.('[translate="no"],script,style,noscript');
  function translateNode(node){
    if(skip(node.parentElement)) return;
    let record=originals.get(node);
    if(!record||node.nodeValue!==record.output) record={source:node.nodeValue};
    record.output=translateText(record.source);originals.set(node,record);
    if(node.nodeValue!==record.output) node.nodeValue=record.output;
  }
  function translateAttributes(element){
    if(skip(element)) return;
    const records=attributeSources.get(element)??{};
    for(const name of attributes){
      if(!element.hasAttribute(name)) continue;
      const value=element.getAttribute(name);
      if(!records[name]||value!==records[name].output) records[name]={source:value};
      const record=records[name];record.output=translateText(record.source);
      if(value!==record.output) element.setAttribute(name,record.output);
    }
    attributeSources.set(element,records);
  }
  function tree(root){
    if(root.nodeType===3){translateNode(root);return;}
    if(root.nodeType!==1||skip(root)) return;
    translateAttributes(root);
    const walker=doc.createTreeWalker(root,1|4);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.nodeType===3) translateNode(node);else translateAttributes(node);
    }
  }
  const observe=()=>observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  observer=new MutationObserver(records=>{
    observer.disconnect();
    for(const record of records){
      if(record.type==='characterData') translateNode(record.target);
      else if(record.type==='attributes') translateAttributes(record.target);
      else for(const node of record.addedNodes) tree(node);
    }
    observe();
  });
  function apply(){
    observer.disconnect();doc.documentElement.lang=current;tree(doc.body);doc.title=title[current];
    if(description) description.content=translateText(descriptionSource);
    observe();
  }
  function setLocale(locale){
    if(!locales.includes(locale)) return false;
    current=locale;
    try{localStorage.setItem('ac-language',locale);}catch{}
    apply();doc.dispatchEvent(new CustomEvent('site:languagechange',{detail:{locale}}));return true;
  }
  apply();
  signal?.addEventListener('abort',()=>{events.abort();observer.disconnect();},{once:true});
  return {setLocale};
}
