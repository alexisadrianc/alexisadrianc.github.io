import test from 'node:test';
import assert from 'node:assert/strict';
import {createIntegrationSteps,connectorTraversal,integrationStages} from '../integration-steps.js';

function setup(t,{reduced=false,width=600}={}){
  const saved=globalThis.ResizeObserver;globalThis.ResizeObserver=undefined;t.after(()=>{globalThis.ResizeObserver=saved;});
  const animations=[];
  const doc=Object.assign(new EventTarget(),{hidden:false,activeElement:null});
  class Element extends EventTarget{
    constructor(kind){super();this.kind=kind;this.style={opacity:'1',transform:'none'};this.dataset={};this.attributes={};this.classes=new Set();this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}
    setAttribute(key,value){this.attributes[key]=value;} removeAttribute(key){delete this.attributes[key];}
    focus(){doc.activeElement=this;}
    getBoundingClientRect(){return {width,height:82};}
    animate(keyframes,options){
      let promise,resolve,reject;
      const animation={kind:this.kind,keyframes,options,get finished(){return promise??=new Promise((yes,no)=>{resolve=yes;reject=no;});},cancel(){this.cancelled=true;reject?.(new Error('cancel'));},finish(){resolve?.();}};
      animations.push(animation);return animation;
    }
  }
  const buttons=integrationStages.map(()=>new Element('button'));
  const states=buttons.map(()=>new Element('state'));buttons.forEach((button,index)=>{button.querySelector=()=>states[index];});
  const flow=new Element('flow');flow.getBoundingClientRect=()=>({width,height:150});
  const particles=Array.from({length:3},()=>new Element('particle'));
  const connectors=particles.map(particle=>{
    const element=new Element('connector');element.querySelector=()=>particle;
    element.getBoundingClientRect=()=>flow.dataset.direction==='vertical'?{width:1,height:40}:{width:80,height:1};return element;
  });
  const message=new Element('message'),body=new Element('body'),next=new Element('next'),root=new Element('root');
  message.querySelector=()=>body;root.querySelector=selector=>({'.integration-flow':flow,'.integration-message':message,'#event-next':next})[selector];
  root.querySelectorAll=selector=>selector==='[data-event-step]'?buttons:connectors;
  doc.defaultView={getComputedStyle:element=>element===message?{minHeight:'82px',paddingTop:'0px',paddingBottom:'0px'}:element.style};
  const motion=Object.assign(new EventTarget(),{matches:reduced});const abort=new AbortController();t.after(()=>abort.abort());
  const changes=[];
  const controller=createIntegrationSteps(root,{motion,signal:abort.signal,doc,onStepChange:step=>changes.push(step)});
  return {controller,buttons,states,connectors,flow,body,next,animations,doc,motion,abort,changes};
}
test('el recorrido contempla saltos y regreso en el orden correcto',()=>{
  assert.deepEqual(connectorTraversal(0,3),[{index:0,direction:1},{index:1,direction:1},{index:2,direction:1}]);
  assert.deepEqual(connectorTraversal(3,0),[{index:2,direction:-1},{index:1,direction:-1},{index:0,direction:-1}]);
  assert.deepEqual(connectorTraversal(2,2),[]);
});
test('hay una etapa actual y el progreso se actualiza al avanzar y retroceder',t=>{
  const env=setup(t,{reduced:true});
  assert.equal(env.buttons[0].attributes['aria-current'],'step');
  env.controller.select(2);
  assert.equal(env.buttons[0].attributes['aria-current'],undefined);assert.equal(env.buttons[2].attributes['aria-current'],'step');
  assert.equal(env.states[0].textContent,'Completada');assert.equal(env.states[2].textContent,'Actual');assert.equal(env.states[3].textContent,'Pendiente');
  assert.ok(env.connectors[1].classes.has('is-passed'));assert.match(env.body.innerHTML,/Odoo utiliza la información recibida/);
  env.controller.select(1);assert.equal(env.states[2].textContent,'Pendiente');assert.equal(env.connectors[1].classes.has('is-passed'),false);
  env.controller.select(3);env.next.dispatchEvent(new Event('click'));assert.equal(env.controller.selected,0);
  assert.deepEqual(env.changes,[2,1,3,0]);
});
test('los clics rápidos cancelan señales anteriores y conservan el último texto',t=>{
  const env=setup(t);env.controller.select(3);
  const prior=env.animations.filter(animation=>animation.kind==='particle');assert.equal(prior.length,3);
  env.controller.select(1);assert.ok(prior.every(animation=>animation.cancelled));
  assert.equal(env.buttons[1].attributes['aria-current'],'step');
  const reverse=env.animations.filter(animation=>animation.kind==='particle').at(-1);
  assert.match(reverse.keyframes[0].transform,/80px/);assert.match(reverse.keyframes.at(-1).transform,/0px/);
  env.doc.hidden=true;env.doc.dispatchEvent(new Event('visibilitychange'));
  assert.ok(env.body.innerHTML.includes(integrationStages[1].description));
});
test('móvil, teclado y movimiento reducido funcionan sin reproducción automática',t=>{
  const env=setup(t,{width:320,reduced:true});assert.equal(env.flow.dataset.direction,'vertical');assert.equal(env.animations.length,0);
  const key=new Event('keydown',{cancelable:true});Object.defineProperty(key,'key',{value:'End'});env.buttons[0].dispatchEvent(key);
  assert.equal(env.controller.selected,3);assert.equal(env.doc.activeElement,env.buttons[3]);assert.equal(env.animations.length,0);
  env.abort.abort();env.buttons[0].dispatchEvent(new Event('click'));assert.equal(env.controller.selected,3);
});
