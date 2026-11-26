import test from 'node:test';
import assert from 'node:assert/strict';
import {createSmoothScroll} from '../smooth-scroll.js';

function environment(reduced=false) {
  const motion=Object.assign(new EventTarget(),{matches:reduced});
  const doc=Object.assign(new EventTarget(),{hidden:false});
  const frames=new Map();
  let nextId=0;
  const win=Object.assign(new EventTarget(),{
    matchMedia:()=>motion,
    requestAnimationFrame:fn=>{frames.set(++nextId,fn);return nextId;},
    cancelAnimationFrame:id=>frames.delete(id),
    scrollTo:value=>{win.restored=value;},
    location:{hash:''},
    history:{pushState:(_state,_title,hash)=>{win.location.hash=hash;}},
  });
  const instances=[];
  class Lenis {
    constructor(options){this.options=options;this.dimensions={resize:()=>{this.dimensionUpdates=(this.dimensionUpdates??0)+1;}};instances.push(this);}
    start(){this.stopped=false;}
    stop(){this.stopped=true;}
    destroy(){this.destroyed=true;}
    raf(time){this.lastFrame=time;}
    scrollTo(target,options){this.lastScroll={target,options};}
  }
  const controller=createSmoothScroll(Lenis,{win,doc});
  return {motion,doc,win,frames,instances,controller};
}
test('movimiento reducido usa scroll nativo y reacciona al cambio de preferencia',()=>{
  const env=environment(true);
  assert.equal(env.instances.length,0);
  assert.equal(env.frames.size,0);
  env.controller.restore(450);
  assert.deepEqual(env.win.restored,{top:450,behavior:'instant'});
  env.motion.matches=false;env.motion.dispatchEvent(new Event('change'));
  assert.equal(env.instances.length,1);
  assert.equal(env.frames.size,1);
  assert.equal(env.instances[0].options.syncTouch,false);
  env.motion.matches=true;env.motion.dispatchEvent(new Event('change'));
  assert.equal(env.instances[0].destroyed,true);
  assert.equal(env.frames.size,0);
  env.controller.destroy();
});

test('el acordeón actualiza dimensiones sin reiniciar scroll ni duplicar RAF',()=>{
  const env=environment();
  for(let i=0;i<30;i++) env.controller.refreshDimensions();
  assert.equal(env.instances.length,1);assert.equal(env.frames.size,1);
  assert.equal(env.instances[0].dimensionUpdates,30);assert.equal(env.instances[0].lastScroll,undefined);
  env.win.innerHeight=800;env.win.scrollY=300;
  env.controller.ensureVisible({getBoundingClientRect:()=>({top:400,bottom:440})});
  assert.equal(env.instances[0].lastScroll,undefined);
  env.controller.ensureVisible({getBoundingClientRect:()=>({top:-10,bottom:30})});
  assert.deepEqual(env.instances[0].lastScroll,{target:278,options:{immediate:true}});
  env.controller.destroy();
});
test('el diálogo pausa el ciclo y la restauración recupera la posición sin animación',()=>{
  const env=environment();
  env.controller.setModalOpen(true);
  assert.equal(env.instances[0].stopped,true);
  assert.equal(env.frames.size,0);
  env.controller.setModalOpen(false);
  env.controller.restore(840);
  assert.equal(env.instances[0].stopped,false);
  assert.equal(env.frames.size,1);
  assert.deepEqual(env.instances[0].lastScroll,{target:840,options:{immediate:true,force:true}});
  env.controller.destroy();
});
test('pestaña oculta y caché de navegación pausan el trabajo; destroy limpia listeners',()=>{
  const env=environment();
  env.doc.hidden=true;env.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.frames.size,0);
  env.doc.hidden=false;env.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.frames.size,1);
  const event=new Event('pagehide');Object.defineProperty(event,'persisted',{value:true});env.win.dispatchEvent(event);
  assert.equal(env.frames.size,0);
  env.win.dispatchEvent(new Event('pageshow'));
  assert.equal(env.frames.size,1);
  env.controller.destroy();
  assert.equal(env.frames.size,0);
  env.win.dispatchEvent(new Event('pageshow'));
  assert.equal(env.frames.size,0);
  assert.equal(env.instances.length,1);
});
test('las anclas conservan hash y foco para teclado al usar Lenis',()=>{
  const env=environment();
  const target={hasAttribute:()=>false,setAttribute:(name,value)=>{target[name]=value;},focus:options=>{target.focusOptions=options;}};
  env.doc.getElementById=id=>id==='contacto'?target:null;
  const link={hash:'#contacto',target:'',hasAttribute:()=>false};
  const event=new Event('click',{cancelable:true});
  Object.defineProperties(event,{button:{value:0},target:{value:{closest:()=>link}}});
  env.doc.dispatchEvent(event);
  assert.equal(event.defaultPrevented,true);
  assert.equal(env.win.location.hash,'#contacto');
  assert.deepEqual(target.focusOptions,{preventScroll:true});
  assert.equal(env.instances[0].lastScroll.target,target);
  env.controller.destroy();
});
