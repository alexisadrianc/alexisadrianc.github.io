import test from 'node:test';
import assert from 'node:assert/strict';
import {initHeroTrail} from '../hero-trail.js';

async function setup(t,{reduced=false,fine=true,protectedRect}={}){
  const motion=Object.assign(new EventTarget(),{matches:reduced});
  const pointer=Object.assign(new EventTarget(),{matches:fine});
  const records=[];
  class Element extends EventTarget{
    constructor(){super();this.style={};this.children=[];this.attributes={};}
    setAttribute(name,value){this.attributes[name]=value;}
    append(child){child.parent=this;this.children.push(child);}
    prepend(child){child.parent=this;this.children.unshift(child);}
    remove(){this.parent.children=this.parent.children.filter(child=>child!==this);}
    animate(keyframes,options){
      const animation={src:this.src,keyframes,options,cancel(){this.cancelled=true;}};
      records.push(animation);return animation;
    }
  }
  const hero=new Element();
  hero.querySelectorAll=()=>protectedRect?[{getBoundingClientRect:()=>protectedRect}]:[];
  hero.getBoundingClientRect=()=>({left:10,top:20,right:1010,bottom:820});
  let collapsed=true,preloads=0,clock=0;
  const doc=Object.assign(new EventTarget(),{hidden:false,createElement:()=>new Element(),getSelection:()=>({isCollapsed:collapsed})});
  const win=Object.assign(new EventTarget(),{
    matchMedia:query=>query.includes('reduced-motion')?motion:pointer,
    Math:{random:()=>.5},
    Image:class{async decode(){preloads++;}},
  });
  const controller=initHeroTrail(hero,{win,doc});t.after(()=>controller.destroy());
  await controller.ready;
  const dispatch=(type,x,y,{buttons=0,pointerType='mouse',elapsed=100}={})=>{
    clock+=elapsed;
    const event=new Event(type);
    Object.defineProperties(event,{clientX:{value:x},clientY:{value:y},pointerType:{value:pointerType},buttons:{value:buttons},timeStamp:{value:clock}});
    hero.dispatchEvent(event);
  };
  return {hero,controller,motion,pointer,records,dispatch,doc,win,get preloads(){return preloads;},select:()=>{collapsed=false;}};
}
test('precarga nueve logos y emite por distancia sin mover los anteriores',async t=>{
  const env=await setup(t);assert.equal(env.preloads,9);
  assert.equal(env.hero.children[0].attributes['aria-hidden'],'true');assert.equal(env.hero.children[0].children.length,12);
  env.dispatch('pointerenter',100,100);env.dispatch('pointermove',150,100);assert.equal(env.records.length,0);
  env.dispatch('pointermove',190,100);assert.equal(env.records.length,1);
  const first=env.hero.children[0].children[0];assert.equal(first.style.left,'180px');assert.equal(first.style.top,'80px');
  env.dispatch('pointermove',280,100);assert.equal(env.records.length,2);assert.equal(first.style.left,'180px');
  assert.notEqual(env.records[0].src,env.records[1].src);
  assert.equal(env.records[0].options.duration,1200);assert.equal(env.records[0].keyframes.at(-1).filter,'blur(10px)');
});
test('reutiliza como máximo doce imágenes y deja terminar el rastro al salir',async t=>{
  const env=await setup(t);env.dispatch('pointerenter',100,100);
  for(let i=0;i<40;i++) env.dispatch('pointermove',i%2?100:300,100);
  assert.equal(env.hero.children[0].children.length,12);assert.ok(env.records.length>12);assert.equal(env.records[0].cancelled,true);
  const latest=env.records.at(-1);env.dispatch('pointerleave',300,100);assert.notEqual(latest.cancelled,true);
  const count=env.records.length;env.dispatch('pointerenter',900,100);env.dispatch('pointermove',910,100);assert.equal(env.records.length,count);
  env.controller.destroy();assert.equal(latest.cancelled,true);assert.equal(env.hero.children.length,0);
});
test('no activa el efecto sin mouse fino/hover ni con movimiento reducido',async t=>{
  for(const options of [{fine:false},{reduced:true}]){
    const env=await setup(t,options);assert.equal(env.preloads,0);
    env.dispatch('pointerenter',100,100);env.dispatch('pointermove',300,100);assert.equal(env.records.length,0);
  }
});
test('cambiar preferencia limpia animaciones y no interfiere con arrastre o selección',async t=>{
  const env=await setup(t);env.dispatch('pointerenter',100,100);env.dispatch('pointermove',300,100,{buttons:1});assert.equal(env.records.length,0);
  env.dispatch('pointermove',400,100);assert.equal(env.records.length,1);
  env.motion.matches=true;env.motion.dispatchEvent(new Event('change'));assert.equal(env.records[0].cancelled,true);
  env.dispatch('pointermove',600,100);assert.equal(env.records.length,1);
  env.motion.matches=false;env.motion.dispatchEvent(new Event('change'));env.select();
  env.dispatch('pointerenter',100,100);env.dispatch('pointermove',500,100);assert.equal(env.records.length,1);
});
test('protege texto pequeño y controles y rechaza movimientos fuera del hero',async t=>{
  const env=await setup(t,{protectedRect:{left:200,top:50,right:400,bottom:160}});
  env.dispatch('pointerenter',100,100);env.dispatch('pointermove',300,100);assert.equal(env.records.length,0);
  env.dispatch('pointermove',600,200);assert.equal(env.records.length,1);
  env.dispatch('pointermove',1100,200);assert.equal(env.records.length,1);
  env.doc.hidden=true;env.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(env.records[0].cancelled,true);
});
