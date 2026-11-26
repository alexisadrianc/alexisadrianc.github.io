import {getLocale,translateText} from './i18n.js';
export function initHeaderControls({setLocale,signal,doc=document,win=window}){
  const events=new AbortController();
  const system=win.matchMedia('(prefers-color-scheme: dark)');
  let preference=win.sitePreferences?.theme??null;
  const root=doc.querySelector('.header-controls');
  const languageControl=root.querySelector('.language-control');
  const trigger=doc.getElementById('language-toggle');
  const menu=doc.getElementById('language-menu');
  const languageButtons=[...menu.querySelectorAll('[data-language]')];
  const themeToggle=doc.getElementById('theme-toggle');
  const on=(node,type,fn)=>node.addEventListener(type,fn,{signal:events.signal});
  function updateThemeAction(){
    const target=doc.documentElement.dataset.theme==='dark'?'light':'dark';
    const label=translateText(target==='dark'?'Activar tema oscuro':'Activar tema claro');
    themeToggle.setAttribute('aria-label',label);themeToggle.setAttribute('title',label);
  }
  function applyTheme(theme){
    doc.documentElement.dataset.theme=theme;doc.documentElement.style.colorScheme=theme;
    doc.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#29434F':'#F2F0E9';
    updateThemeAction();
  }
  function closeMenu(returnFocus=false){
    menu.hidden=true;trigger.setAttribute('aria-expanded','false');
    if(returnFocus) trigger.focus({preventScroll:true});
  }
  function updateLanguage(){
    const locale=getLocale();
    doc.getElementById('language-current').textContent=locale.toUpperCase();
    trigger.setAttribute('aria-label',`${translateText('Cambiar idioma')}: ${{es:'Español',en:'English',fr:'Français'}[locale]}`);
    for(const button of languageButtons){
      const selected=button.dataset.language===locale;
      button.setAttribute('aria-checked',String(selected));button.tabIndex=selected?0:-1;
    }
    updateThemeAction();
  }
  on(themeToggle,'click',()=>{
    preference=doc.documentElement.dataset.theme==='dark'?'light':'dark';
    try{win.localStorage.setItem('ac-theme',preference);}catch{}
    applyTheme(preference);
  });
  on(system,'change',()=>{if(!preference) applyTheme(system.matches?'dark':'light');});
  on(trigger,'click',()=>{
    const open=menu.hidden;menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
    if(open) languageButtons.find(button=>button.dataset.language===getLocale()).focus({preventScroll:true});
  });
  for(const button of languageButtons) on(button,'click',()=>{setLocale(button.dataset.language);closeMenu(true);});
  on(doc,'site:languagechange',updateLanguage);
  on(doc,'click',event=>{if(!languageControl.contains(event.target)) closeMenu();});
  on(doc,'keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();closeMenu(true);}});
  on(menu,'keydown',event=>{
    const index=languageButtons.indexOf(doc.activeElement);
    const targets={ArrowDown:(index+1)%3,ArrowUp:(index+2)%3,Home:0,End:2};
    if(event.key in targets){
      event.preventDefault();const target=languageButtons[targets[event.key]];
      for(const button of languageButtons) button.tabIndex=button===target?0:-1;
      target.focus();
    }
  });
  on(languageControl,'focusout',event=>{if(event.relatedTarget&&!languageControl.contains(event.relatedTarget)) closeMenu();});
  applyTheme(preference??(system.matches?'dark':'light'));updateLanguage();
  signal?.addEventListener('abort',()=>events.abort(),{once:true});
}
