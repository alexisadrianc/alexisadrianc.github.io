// Shared WAAPI timing with the experience accordion; no extra RAF loop.
export function createDemoTransition(panel,{motion,onResize=()=>{},signal,doc=document}) {
  const content=panel.querySelector('.demo-content');
  const events=new AbortController();
  const easing='cubic-bezier(.22,1,.36,1)';
  let animations=[];
  let revision=0;
  let pendingRender;
  let initialized=false;

  function cancel(){for(const animation of animations) animation.cancel();animations=[];}
  function settle(){
    cancel();panel.style.height='auto';
    content.style.opacity='1';content.style.transform='none';content.inert=false;
    panel.setAttribute('aria-busy','false');onResize();
  }
  function commit(){const render=pendingRender;pendingRender=undefined;render?.();}
  async function replace(render){
    const version=++revision;
    pendingRender=render;
    const height=panel.getBoundingClientRect().height;
    const computed=doc.defaultView.getComputedStyle(content);
    const from={opacity:computed.opacity,transform:computed.transform};
    // Freeze the currently rendered state before canceling an interrupted change.
    panel.style.height=`${height}px`;
    content.style.opacity=from.opacity;content.style.transform=from.transform;
    cancel();
    if(!initialized||motion.matches||typeof content.animate!=='function'){
      initialized=true;commit();settle();return;
    }
    panel.setAttribute('aria-busy','true');content.inert=true;
    if(Number(from.opacity)>.05){
      const exit=content.animate([from,{opacity:0,transform:'translateY(-4px)'}],{duration:120,easing,fill:'both'});
      animations=[exit];
      await exit.finished.catch(()=>{});
      if(version!==revision) return;
    }
    content.style.opacity='0';content.style.transform='translateY(8px)';cancel();
    commit();content.inert=false;
    const style=doc.defaultView.getComputedStyle(panel);
    const target=Math.max(parseFloat(style.minHeight)||0,content.getBoundingClientRect().height+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom));
    const resize=panel.animate([{height:`${height}px`},{height:`${target}px`}],{duration:480,easing,fill:'both'});
    const enter=content.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0px)'}],{duration:400,easing,fill:'both'});
    animations=[resize,enter];onResize();
    await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));
    if(version===revision) settle();
  }
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(onResize):undefined;
  observer?.observe(panel);
  motion.addEventListener('change',()=>{
    if(motion.matches){revision++;commit();settle();}
  },{signal:events.signal});
  doc.addEventListener('visibilitychange',()=>{
    if(doc.hidden){revision++;commit();settle();}
  },{signal:events.signal});
  signal?.addEventListener('abort',()=>{
    revision++;pendingRender=undefined;events.abort();observer?.disconnect();settle();
  },{once:true});
  return {replace};
}
