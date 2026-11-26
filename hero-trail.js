export const heroTechnologies=[
  {name:'Python',src:'assets/tech/python.svg',width:66,height:66},
  {name:'Odoo',src:'assets/tech/odoo.svg',width:112,height:44},
  {name:'PostgreSQL',src:'assets/tech/postgresql.png',width:66,height:72},
  {name:'JavaScript',src:'assets/tech/javascript.svg',width:62,height:62},
  {name:'Django',src:'assets/tech/django.svg',width:120,height:48},
  {name:'Docker',src:'assets/tech/docker.svg',width:86,height:64},
  {name:'Git',src:'assets/tech/git.svg',width:62,height:62},
  {name:'HTML',src:'assets/tech/html.svg',width:60,height:68},
  {name:'CSS',src:'assets/tech/css.svg',width:62,height:62},
];

export function initHeroTrail(hero,{signal,win=window,doc=document,assets=heroTechnologies}={}){
  const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=win.matchMedia('(hover: hover) and (pointer: fine)');
  const events=new AbortController();
  const layer=doc.createElement('div');
  layer.className='hero-trail';layer.setAttribute('aria-hidden','true');
  hero.prepend(layer);
  const slots=[];
  const protectedElements=[...hero.querySelectorAll('.hero-meta,.hero-bottom,.hero-foot,.last-line em')];
  let loading;
  let readyAssets=[];
  let previous;
  let distance=0;
  let lastTime=-Infinity;
  let nextSlot=0;
  let nextAsset=0;
  let order=0;
  let destroyed=false;
  const enabled=()=>!destroyed&&!motion.matches&&pointer.matches&&!doc.hidden;
  const reset=()=>{previous=undefined;distance=0;lastTime=-Infinity;};
  function clear(){
    reset();
    for(const slot of slots){slot.animation?.cancel();slot.animation=undefined;slot.image.style.opacity='0';}
  }
  function prepare(){
    if(!enabled()||loading) return;
    // Decode once before emitting; failed assets never appear as broken images.
    loading=Promise.all(assets.map(async asset=>{
      const image=new win.Image();image.decoding='async';image.src=asset.src;
      try{await image.decode();return asset;}catch{return undefined;}
    })).then(results=>{
      if(destroyed) return;
      readyAssets=results.filter(Boolean);
      if(readyAssets.length<2) return;
      for(let i=0;i<12;i++){
        const image=doc.createElement('img');
        image.className='hero-trail-logo';image.alt='';image.draggable=false;
        image.decoding='async';layer.append(image);slots.push({image,animation:undefined});
      }
      reset();
    });
  }
  function changePreference(){clear();prepare();}
  function emit(x,y){
    if(!slots.length) return;
    const asset=readyAssets[nextAsset%readyAssets.length];
    const rect=hero.getBoundingClientRect();
    const left=rect.left+x,top=rect.top+y;
    // Keep small copy, interactive controls and the blue emphasis unobstructed.
    if(protectedElements.some(element=>{
      const bounds=element.getBoundingClientRect();
      return left+asset.width/2>bounds.left-8&&left-asset.width/2<bounds.right+8&&top+asset.height/2>bounds.top-8&&top-asset.height/2<bounds.bottom+8;
    })) return;
    nextAsset++;
    const slot=slots[nextSlot++%slots.length];
    slot.animation?.cancel();
    const image=slot.image;
    image.src=asset.src;image.width=asset.width;image.height=asset.height;
    image.style.width=`${asset.width}px`;image.style.height=`${asset.height}px`;
    image.style.left=`${x}px`;image.style.top=`${y}px`;image.style.zIndex=String(++order);
    const angle=win.Math.random()*16-8;
    const scale=.94+win.Math.random()*.12;
    const transform=value=>`translate(-50%, -50%) rotate(${angle}deg) scale(${scale*value})`;
    const animation=image.animate([
      {offset:0,opacity:0,filter:'blur(2px)',transform:transform(.85),easing:'cubic-bezier(.22,1,.36,1)'},
      {offset:.17,opacity:.64,filter:'blur(0px)',transform:transform(1)},
      {offset:.52,opacity:.64,filter:'blur(0px)',transform:transform(1),easing:'cubic-bezier(.4,0,.2,1)'},
      {offset:1,opacity:0,filter:'blur(10px)',transform:transform(.92)},
    ],{duration:1100+win.Math.random()*200,easing:'linear',fill:'both'});
    slot.animation=animation;
    animation.onfinish=()=>{
      if(slot.animation!==animation) return;
      image.style.opacity='0';animation.cancel();slot.animation=undefined;
    };
  }
  hero.addEventListener('pointerenter',event=>{
    reset();if(enabled()&&event.pointerType==='mouse') previous={x:event.clientX,y:event.clientY};
  },{passive:true,signal:events.signal});
  hero.addEventListener('pointerleave',reset,{passive:true,signal:events.signal});
  hero.addEventListener('pointermove',event=>{
    if(!enabled()||event.pointerType!=='mouse'||!slots.length) return;
    const point={x:event.clientX,y:event.clientY};
    if(event.buttons||doc.getSelection()?.isCollapsed===false){previous=point;distance=0;return;}
    if(!previous){previous=point;return;}
    distance+=Math.hypot(point.x-previous.x,point.y-previous.y);previous=point;
    if(distance<84||event.timeStamp-lastTime<65) return;
    distance=0;lastTime=event.timeStamp;
    const rect=hero.getBoundingClientRect();
    if(point.x<rect.left||point.x>rect.right||point.y<rect.top||point.y>rect.bottom){reset();return;}
    emit(point.x-rect.left,point.y-rect.top);
  },{passive:true,signal:events.signal});
  motion.addEventListener('change',changePreference,{signal:events.signal});
  pointer.addEventListener('change',changePreference,{signal:events.signal});
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden) clear();else reset();},{signal:events.signal});
  win.addEventListener('resize',reset,{passive:true,signal:events.signal});
  win.addEventListener('blur',clear,{signal:events.signal});
  win.addEventListener('pagehide',clear,{signal:events.signal});
  function destroy(){
    if(destroyed) return;
    destroyed=true;events.abort();signal?.removeEventListener('abort',destroy);clear();layer.remove();
  }
  signal?.addEventListener('abort',destroy,{once:true});
  if(signal?.aborted) destroy();else if(typeof layer.animate==='function') prepare();
  return {destroy,get ready(){return loading??Promise.resolve();}};
}
