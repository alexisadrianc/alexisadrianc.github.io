import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoTransition} from '../demo-transition.js';

function setup(t){
  const originalObserver=globalThis.ResizeObserver;
  globalThis.ResizeObserver=undefined;
  t.after(()=>{globalThis.ResizeObserver=originalObserver;});
  const motion=Object.assign(new EventTarget(),{matches:false});
  const signal=new AbortController();t.after(()=>signal.abort());
  const animations=[];
  function animate(keyframes,options){
    let resolve,reject;
    const finished=new Promise((ok,fail)=>{resolve=ok;reject=fail;});
    const animation={keyframes,options,finished,finish:resolve,cancel:()=>{animation.cancelled=true;reject(new Error('cancelled'));}};
    animations.push(animation);return animation;
  }
  const content={style:{opacity:'1',transform:'none'},animate,getBoundingClientRect:()=>({height:500})};
  const panel={style:{},attributes:{},setAttribute(name,value){this.attributes[name]=value;},animate,querySelector:()=>content,getBoundingClientRect:()=>({height:700})};
  const doc=Object.assign(new EventTarget(),{hidden:false,defaultView:{getComputedStyle:element=>element===content?content.style:{minHeight:'515px',paddingTop:'32px',paddingBottom:'32px'}}});
  const controller=createDemoTransition(panel,{motion,signal:signal.signal,doc});
  return {controller,motion,content,panel,animations};
}
const flush=async()=>{await Promise.resolve();await Promise.resolve();};
test('conserva la superficie y anima entre alturas reales al cambiar contenido',async t=>{
  const env=setup(t);const commits=[];
  await env.controller.replace(()=>commits.push('initial'));
  const change=env.controller.replace(()=>commits.push('new'));
  assert.equal(env.content.inert,true);assert.equal(env.panel.style.height,'700px');
  env.animations[0].finish();await flush();
  assert.deepEqual(commits,['initial','new']);
  assert.deepEqual(env.animations[1].keyframes,[{height:'700px'},{height:'564px'}]);
  assert.equal(env.animations[1].options.duration,480);
  env.animations[1].finish();env.animations[2].finish();await change;
  assert.equal(env.panel.style.height,'auto');assert.equal(env.panel.attributes['aria-busy'],'false');
});
test('las selecciones rápidas solo muestran el último contenido solicitado',async t=>{
  const env=setup(t);const commits=[];
  await env.controller.replace(()=>commits.push('initial'));
  const obsolete=env.controller.replace(()=>commits.push('obsolete'));
  const current=env.controller.replace(()=>commits.push('current'));
  assert.equal(env.animations[0].cancelled,true);
  env.animations[1].finish();await flush();
  env.animations[2].finish();env.animations[3].finish();await Promise.all([obsolete,current]);
  assert.deepEqual(commits,['initial','current']);assert.equal(env.content.inert,false);
});
test('activar movimiento reducido completa el cambio pendiente sin esperas',async t=>{
  const env=setup(t);const commits=[];
  await env.controller.replace(()=>commits.push('initial'));
  const change=env.controller.replace(()=>commits.push('new'));
  env.motion.matches=true;env.motion.dispatchEvent(new Event('change'));await change;
  assert.deepEqual(commits,['initial','new']);assert.equal(env.content.style.opacity,'1');
  assert.equal(env.panel.style.height,'auto');assert.equal(env.content.inert,false);
});
