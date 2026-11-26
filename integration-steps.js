import {createDemoTransition} from './demo-transition.js';
import {translateText as t} from './i18n.js';

export const integrationStages=[
  {label:'Telefonía',description:'Entra una llamada en la plataforma de telefonía.',icon:'<svg viewBox="0 0 24 24"><path d="m8 3 3 5-3 2a14 14 0 0 0 6 6l2-3 5 3c1 1-1 5-3 5C10 21 3 14 3 6c0-2 4-4 5-3Z"/></svg>'},
  {label:'Integración',description:'La integración recibe el evento y prepara la información para Odoo.',icon:'<svg viewBox="0 0 24 24"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg>'},
  {label:'Odoo',description:'Odoo utiliza la información recibida para mostrar el contexto disponible.',icon:'<span class="integration-odoo-symbol"><img src="assets/tech/odoo.svg" width="621" height="196" alt="" draggable="false"></span>'},
  {label:'Equipo',description:'El equipo puede consultar ese contexto para atender la llamada.',icon:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m3 10v-2a6 6 0 0 0-2-4"/></svg>'},
];
export function connectorTraversal(from,to){
  const direction=to>from?1:-1;
  return Array.from({length:Math.abs(to-from)},(_,index)=>({index:direction>0?from+index:from-1-index,direction}));
}

export function createIntegrationSteps(root,{initialStep=0,onStepChange=()=>{},onResize=()=>{},signal,motion,doc=document}={}){
  const events=new AbortController();
  let selected=Math.max(0,Math.min(3,initialStep));
  let pulses=[];
  root.innerHTML=`<div class="integration-flow"><ol class="integration-band" aria-label="${t('Etapas del evento')}">${integrationStages.map((stage,index)=>`<li class="integration-segment"><button type="button" class="integration-step" data-event-step="${index}" aria-controls="integration-message"><span class="integration-circle" aria-hidden="true">${stage.icon}<span class="integration-check"><svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7"/></svg></span></span><span class="integration-step-text"><span class="integration-step-label">${t(stage.label)}</span><span class="integration-step-state"></span></span></button>${index<3?`<span class="integration-connector" data-event-connector="${index}" aria-hidden="true"><span class="integration-signal"></span></span>`:''}</li>`).join('')}</ol></div><div class="integration-message" id="integration-message" role="status" aria-live="polite" aria-atomic="true"><div class="demo-content"></div></div><button type="button" class="demo-button" id="event-next"></button><p class="demo-note">${t('Simulación local. Sin conexiones reales. El flujo es una explicación conceptual, no la arquitectura del caso Maubius.')}</p>`;
  const flow=root.querySelector('.integration-flow');
  const buttons=[...root.querySelectorAll('[data-event-step]')];
  const connectors=[...root.querySelectorAll('[data-event-connector]')];
  const message=root.querySelector('.integration-message');
  const messageBody=message.querySelector('.demo-content');
  const next=root.querySelector('#event-next');
  const transitions=createDemoTransition(message,{motion,onResize,signal:events.signal,doc});
  const on=(node,event,fn)=>node.addEventListener(event,fn,{signal:events.signal});

  function stopPulses(){for(const animation of pulses) animation.cancel();pulses=[];}
  function updateOrientation(){
    const direction=flow.getBoundingClientRect().width<440?'vertical':'horizontal';
    if(flow.dataset.direction!==direction){stopPulses();flow.dataset.direction=direction;}
    onResize();
  }
  function illuminate(from,to){
    stopPulses();
    if(motion.matches||doc.hidden) return;
    const vertical=flow.dataset.direction==='vertical';
    for(const [order,part] of connectorTraversal(from,to).entries()){
      const connector=connectors[part.index];
      const particle=connector.querySelector('.integration-signal');
      if(typeof particle.animate!=='function') continue;
      const bounds=connector.getBoundingClientRect();
      const length=vertical?bounds.height:bounds.width;
      const start=part.direction>0?0:length,end=part.direction>0?length:0;
      const at=position=>`translate(-50%, -50%) translate${vertical?'Y':'X'}(${position}px)`;
      pulses.push(particle.animate([
        {offset:0,opacity:0,transform:at(start)},
        {offset:.12,opacity:1,transform:at(start+(end-start)*.12)},
        {offset:.85,opacity:1,transform:at(start+(end-start)*.85)},
        {offset:1,opacity:0,transform:at(end)},
      ],{duration:260,delay:order*130,easing:'linear',fill:'none'}));
    }
  }
  function render(){
    for(const [index,button] of buttons.entries()){
      const current=index===selected,done=index<selected;
      if(current) button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      button.classList.toggle('is-current',current);button.classList.toggle('is-done',done);
      button.querySelector('.integration-step-state').textContent=t(current?'Actual':done?'Completada':'Pendiente');
    }
    connectors.forEach((connector,index)=>connector.classList.toggle('is-passed',index<selected));
    next.textContent=t(selected===3?'Reiniciar recorrido':'Siguiente etapa');
    transitions.replace(()=>{messageBody.innerHTML=`<p>${t(integrationStages[selected].description)}</p>`;});
  }
  function select(index){
    if(!Number.isInteger(index)||index<0||index>3||index===selected) return;
    const previous=selected;selected=index;
    render();illuminate(previous,selected);onStepChange(selected);
  }
  for(const [index,button] of buttons.entries()){
    on(button,'click',()=>select(index));
    on(button,'keydown',event=>{
      const targets={ArrowRight:Math.min(3,index+1),ArrowDown:Math.min(3,index+1),ArrowLeft:Math.max(0,index-1),ArrowUp:Math.max(0,index-1),Home:0,End:3};
      if(!(event.key in targets)) return;
      event.preventDefault();const target=targets[event.key];buttons[target].focus();select(target);
    });
  }
  on(next,'click',()=>select((selected+1)%4));
  on(motion,'change',()=>{if(motion.matches) stopPulses();});
  on(doc,'visibilitychange',()=>{if(doc.hidden) stopPulses();});
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(updateOrientation):undefined;
  observer?.observe(flow);
  function destroy(){stopPulses();observer?.disconnect();events.abort();signal?.removeEventListener('abort',destroy);}
  signal?.addEventListener('abort',destroy,{once:true});
  updateOrientation();render();
  if(signal?.aborted) destroy();
  return {select,destroy,get selected(){return selected;}};
}
