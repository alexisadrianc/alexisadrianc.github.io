// WAAPI drives layout and paint; ResizeObserver shares dimensions with Lenis.
export function initExperienceAccordion(root,{motion,onResize=()=>{},ensureVisible=()=>{},signal,doc=document}={}) {
  const events=new AbortController();
  const controllers=[];
  const buttons=[...root.querySelectorAll('.experience-trigger')];
  const easing='cubic-bezier(.22,1,.36,1)';
  const duration=500;
  for(const button of buttons) {
    const panel=doc.getElementById(button.getAttribute('aria-controls'));
    const body=panel.querySelector('.experience-panel-body');
    const vertical=button.querySelector('.experience-icon-vertical');
    let open=button.getAttribute('aria-expanded')==='true';
    let animations=[];
    let revision=0;
    let measuredHeight=0;
    const readStyle=element=>doc.defaultView.getComputedStyle(element);

    function cancel(){
      revision++;
      for(const animation of animations) animation.cancel();
      animations=[];
    }
    function settle(){
      cancel();
      panel.style.height=open?'auto':'0px';
      panel.style.overflow=open?'visible':'hidden';
      panel.hidden=!open;
      body.style.opacity=open?'1':'0';
      body.style.transform=open?'translateY(0px)':'translateY(8px)';
      vertical.style.opacity=open?'0':'1';
      vertical.style.transform=`translate(-50%, -50%) rotate(${open?90:0}deg)`;
      onResize();
    }
    function transition(next,fromUser=false){
      open=next;
      button.setAttribute('aria-expanded',String(open));
      if(!open&&panel.contains(doc.activeElement)) button.focus({preventScroll:true});
      panel.inert=!open;
      panel.setAttribute('aria-hidden',String(!open));
      panel.hidden=false;
      if(fromUser) ensureVisible(button);

      // Read the rendered in-flight values before canceling, including rapid reversals.
      const height=panel.getBoundingClientRect().height;
      measuredHeight=body.getBoundingClientRect().height;
      const contentStyle=readStyle(body);
      const iconStyle=readStyle(vertical);
      const contentFrom={opacity:contentStyle.opacity,transform:contentStyle.transform};
      const iconFrom={opacity:iconStyle.opacity,transform:iconStyle.transform};
      cancel();
      panel.style.height=`${height}px`;
      panel.style.overflow='hidden';
      body.style.opacity=contentFrom.opacity;
      body.style.transform=contentFrom.transform;
      vertical.style.opacity=iconFrom.opacity;
      vertical.style.transform=iconFrom.transform;
      if(motion.matches||typeof panel.animate!=='function') {settle();return;}

      const target=open?measuredHeight:0;
      if(Math.abs(target-height)<.25) {settle();return;}
      // A reversal travels only the remaining distance, at the same perceived speed.
      const remaining=Math.min(1,Math.abs(target-height)/Math.max(measuredHeight,1));
      const options={duration:duration*remaining,easing,fill:'both'};
      animations=[
        panel.animate([{height:`${height}px`},{height:`${target}px`}],options),
        body.animate([contentFrom,{opacity:open?1:0,transform:open?'translateY(0px)':'translateY(8px)'}],options),
        vertical.animate([iconFrom,{opacity:open?0:1,transform:`translate(-50%, -50%) rotate(${open?90:0}deg)`}],options),
      ];
      const currentRevision=revision;
      animations[0].onfinish=()=>{if(revision===currentRevision) settle();};
      onResize();
    }
    const observer=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{
      // ResizeObserver follows each animated height without a second RAF loop.
      onResize();
      if(entries.some(entry=>entry.target===body)&&!panel.hidden){
        const nextHeight=body.getBoundingClientRect().height;
        if(animations.length&&Math.abs(nextHeight-measuredHeight)>.5) transition(open);
      }
    }):undefined;
    observer?.observe(panel);
    observer?.observe(body);
    button.addEventListener('click',()=>transition(!open,true),{signal:events.signal});
    button.addEventListener('keydown',event=>{
      const index=buttons.indexOf(button);
      const targets={ArrowDown:(index+1)%buttons.length,ArrowUp:(index-1+buttons.length)%buttons.length,Home:0,End:buttons.length-1};
      if(!(event.key in targets)) return;
      event.preventDefault();
      buttons[targets[event.key]].focus();
    },{signal:events.signal});
    const finish=()=>settle();
    motion.addEventListener('change',()=>{if(motion.matches) finish();},{signal:events.signal});
    doc.addEventListener('visibilitychange',()=>{if(doc.hidden) finish();},{signal:events.signal});
    controllers.push(()=>{observer?.disconnect();finish();});
    panel.inert=!open;
    panel.setAttribute('aria-hidden',String(!open));
    settle();
  }
  function destroy(){events.abort();for(const cleanup of controllers) cleanup();}
  signal?.addEventListener('abort',destroy,{once:true});
  if(signal?.aborted) destroy();
  return {destroy};
}
