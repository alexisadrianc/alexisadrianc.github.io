// Local dependency; failure leaves the portfolio and native scrolling usable.
export function createSmoothScroll(Lenis, {win = window, doc = document} = {}) {
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let instance;
  let frame;
  let modalOpen = false;

  function cancelFrame() {
    if (frame !== undefined) win.cancelAnimationFrame(frame);
    frame = undefined;
  }
  function tick(time) {
    frame = undefined;
    if (!instance || modalOpen || doc.hidden) return;
    instance.raf(time);
    frame = win.requestAnimationFrame(tick);
  }
  function sync() {
    cancelFrame();
    if (motion.matches) {
      instance?.destroy();
      instance = undefined;
      return;
    }
    instance ??= new Lenis({
      autoRaf:false,
      lerp:0.09,
      smoothWheel:true,
      syncTouch:false, // Preserve native touch inertia.
      anchors:false, // Handled below to retain hash and keyboard focus semantics.
    });
    if (modalOpen || doc.hidden) instance.stop();
    else {
      instance.start();
      frame = win.requestAnimationFrame(tick);
    }
  }
  doc.addEventListener('click', event => {
    if (!instance || modalOpen || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    let target;
    try { target = doc.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    if (win.location.hash !== link.hash) win.history.pushState(null, '', link.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
    instance.scrollTo(target);
  }, {signal:events.signal});
  motion.addEventListener('change', sync, {signal:events.signal});
  doc.addEventListener('visibilitychange', sync, {signal:events.signal});
  win.addEventListener('pagehide', event => {
    if (event.persisted) {
      cancelFrame();
      instance?.stop();
    } else destroy();
  }, {signal:events.signal});
  win.addEventListener('pageshow', sync, {signal:events.signal});

  function destroy() {
    events.abort();
    cancelFrame();
    instance?.destroy();
    instance = undefined;
  }
  sync();
  return {
    setModalOpen(open) { modalOpen = open; sync(); },
    // Lenis.resize() resets targetScroll, which would cancel wheel inertia on
    // every accordion frame. Refresh its public Dimensions object instead.
    refreshDimensions() { instance?.dimensions.resize(); },
    ensureVisible(element) {
      if(modalOpen||doc.hidden) return;
      const rect=element.getBoundingClientRect();
      const margin=12;
      const delta=rect.top<margin?rect.top-margin:rect.bottom>win.innerHeight-margin?rect.bottom-win.innerHeight+margin:0;
      if(!delta) return;
      const position=win.scrollY+delta;
      if(instance) instance.scrollTo(position,{immediate:true});
      else win.scrollTo({top:position,behavior:'instant'});
    },
    restore(position) {
      if (instance) instance.scrollTo(position, {immediate:true, force:true});
      else win.scrollTo({top:position, behavior:'instant'});
    },
    destroy,
  };
}
