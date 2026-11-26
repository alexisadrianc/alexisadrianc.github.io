import test from 'node:test';
import assert from 'node:assert/strict';
import {initExperienceAccordion} from '../experience-accordion.js';

function setup(t,{reduced=false,count=1}={}){
  const savedObserver=globalThis.ResizeObserver;
  const observers=[];
  globalThis.ResizeObserver=class {
    constructor(callback){this.callback=callback;observers.push(this);}
    observe(){} disconnect(){this.disconnected=true;}
  };
  t.after(()=>{globalThis.ResizeObserver=savedObserver;});
  const doc=Object.assign(new EventTarget(),{hidden:false,activeElement:null,defaultView:{getComputedStyle:element=>({...element.style,...element.computed})}});
  const motion=Object.assign(new EventTarget(),{matches:reduced});
  const signal=new AbortController();
  const allAnimations=[];
  class Element extends EventTarget {
    constructor(){super();this.attributes={};this.style={};this.computed={};}
    setAttribute(name,value){this.attributes[name]=value;}
    getAttribute(name){return this.attributes[name];}
    focus(options){doc.activeElement=this;this.focusOptions=options;}
    animate(keyframes,options){
      const animation={keyframes,options,cancel(){this.cancelled=true;},finish:()=>{this.renderedHeight=undefined;Object.assign(this.style,keyframes.at(-1));animation.onfinish?.();}};
      allAnimations.push(animation);return animation;
    }
  }
  const rows=Array.from({length:count},(_,i)=>{
    const button=new Element(),panel=new Element(),body=new Element(),vertical=new Element();
    button.setAttribute('aria-controls',`panel-${i}`);button.setAttribute('aria-expanded','false');
    panel.hidden=true;panel.inert=true;body.naturalHeight=96;
    button.querySelector=()=>vertical;panel.querySelector=()=>body;
    panel.contains=element=>element===body;
    body.getBoundingClientRect=()=>({height:body.naturalHeight});
    panel.getBoundingClientRect=()=>({height:panel.hidden?0:panel.renderedHeight??(panel.style.height==='auto'?body.naturalHeight:parseFloat(panel.style.height)||0)});
    return {button,panel,body,vertical};
  });
  doc.getElementById=id=>rows[Number(id.split('-')[1])].panel;
  let resizes=0;
  const controller=initExperienceAccordion({querySelectorAll:()=>rows.map(row=>row.button)},{motion,signal:signal.signal,doc,onResize:()=>resizes++});
  t.after(()=>controller.destroy());
  return {doc,motion,signal,rows,observers,animations:allAnimations,controller,get resizes(){return resizes;}};
}
test('mide la altura real, sincroniza los trazos y oculta el contenido al cerrar',t=>{
  const env=setup(t);const {button,panel,body,vertical}=env.rows[0];
  button.dispatchEvent(new Event('click'));
  assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(panel.inert,false);
  assert.deepEqual(env.animations[0].keyframes,[{height:'0px'},{height:'96px'}]);
  assert.equal(env.animations[0].options.duration,500);
  assert.equal(env.animations[2].keyframes[1].opacity,0);
  env.animations[0].finish();
  assert.equal(panel.style.height,'auto');assert.equal(body.style.opacity,'1');assert.equal(vertical.style.opacity,'0');
  button.dispatchEvent(new Event('click'));
  assert.equal(panel.inert,true);assert.equal(panel.getAttribute('aria-hidden'),'true');
  assert.deepEqual(env.animations[3].keyframes,[{height:'96px'},{height:'0px'}]);
  env.animations[3].finish();assert.equal(panel.hidden,true);assert.equal(vertical.style.opacity,'1');
});
test('clics rápidos parten del estado visible y descartan callbacks anteriores',t=>{
  const env=setup(t);const {button,panel,body,vertical}=env.rows[0];
  button.dispatchEvent(new Event('click'));
  const staleFinish=env.animations[0].onfinish;
  panel.renderedHeight=24;body.computed={opacity:'.25',transform:'translateY(6px)'};vertical.computed={opacity:'.75',transform:'rotate(22.5deg)'};
  button.dispatchEvent(new Event('click'));
  assert.equal(env.animations[0].cancelled,true);
  assert.equal(env.animations[3].keyframes[0].height,'24px');assert.equal(env.animations[3].options.duration,125);
  assert.equal(env.animations[4].keyframes[0].opacity,'.25');
  staleFinish();assert.equal(panel.hidden,false);
  panel.renderedHeight=12;
  button.dispatchEvent(new Event('click'));
  assert.equal(env.animations[6].keyframes[0].height,'12px');assert.equal(env.animations[6].keyframes[1].height,'96px');
  env.animations[6].finish();assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(panel.style.height,'auto');
});
test('recalcula el destino al cambiar la altura por reflujo móvil',t=>{
  const env=setup(t);const {button,panel,body}=env.rows[0];
  button.dispatchEvent(new Event('click'));panel.renderedHeight=30;body.naturalHeight=176;
  env.observers[0].callback([{target:body},{target:panel}]);
  assert.equal(env.animations[3].keyframes[0].height,'30px');assert.equal(env.animations[3].keyframes[1].height,'176px');
  assert.ok(env.resizes>1);env.animations[3].finish();assert.equal(panel.style.height,'auto');
});
test('movimiento reducido cancela animaciones y cerrar recupera el foco',t=>{
  const env=setup(t);const {button,panel,body}=env.rows[0];
  button.dispatchEvent(new Event('click'));
  env.motion.matches=true;env.motion.dispatchEvent(new Event('change'));
  assert.equal(env.animations[0].cancelled,true);assert.equal(panel.style.height,'auto');
  env.doc.activeElement=body;button.dispatchEvent(new Event('click'));
  assert.equal(env.doc.activeElement,button);assert.deepEqual(button.focusOptions,{preventScroll:true});
  assert.equal(panel.hidden,true);assert.equal(panel.inert,true);assert.equal(env.animations.length,3);
});
test('navegación entre cabeceras y limpieza de observers y eventos',t=>{
  const env=setup(t,{count:2});
  const event=new Event('keydown',{cancelable:true});Object.defineProperty(event,'key',{value:'ArrowDown'});
  env.rows[0].button.dispatchEvent(event);assert.equal(env.doc.activeElement,env.rows[1].button);assert.equal(event.defaultPrevented,true);
  env.signal.abort();assert.ok(env.observers.every(observer=>observer.disconnected));
  env.rows[0].button.dispatchEvent(new Event('click'));assert.equal(env.rows[0].panel.hidden,true);
});
