(() => {
  'use strict';
  if (document.getElementById('screenshot-viewer')) return;
  const style = document.createElement('style');
  style.textContent = `
    .screenshot-viewer{width:min(1180px,94vw);height:min(880px,90dvh);max-width:94vw;max-height:90dvh;padding:0;border:1px solid var(--border,#a3293350);border-radius:10px;background:var(--bg,#211719);color:var(--text,#f8eade);box-shadow:0 24px 90px #0008;overflow:hidden}
    .screenshot-viewer::backdrop{background:#080b14b8;backdrop-filter:blur(5px)}
    .screenshot-viewer[open]{display:flex;flex-direction:column;animation:screenshot-appear .18s ease-out}
    .screenshot-viewer header{display:flex;align-items:center;gap:16px;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border,#a3293350);flex-shrink:0}
    .screenshot-viewer h2{font:600 14px/1.5 system-ui,sans-serif;letter-spacing:0;margin:0;overflow-wrap:anywhere}
    .screenshot-viewer-controls{display:flex;gap:8px;flex-shrink:0}
    .screenshot-viewer button{padding:8px 12px;border:1px solid var(--border,#a3293350);border-radius:5px;background:var(--surface,#352329);color:var(--text,#f8eade);font:12px system-ui,sans-serif;cursor:pointer}
    .screenshot-viewer button:hover{border-color:var(--blue,var(--accent,#f15a70))}
    .screenshot-viewer button:focus-visible{outline:2px solid var(--blue,var(--accent,#f15a70));outline-offset:2px}
    .screenshot-viewer-stage{flex:1;min-height:0;overflow:auto;display:grid;place-items:center;padding:14px;background:var(--bg-alt,#151720);overscroll-behavior:contain}
    .screenshot-viewer img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;margin:auto}
    .screenshot-viewer.is-original .screenshot-viewer-stage{display:block}
    .screenshot-viewer.is-original img{max-width:none;max-height:none}
    .screenshot-viewer-status{padding:10px 18px;margin:0;border-top:1px solid var(--border,#a3293350);font:12px/1.4 system-ui,sans-serif;color:var(--muted,#dec9c1);flex-shrink:0}
    @keyframes screenshot-appear{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
    @media(max-width:600px){.screenshot-viewer header{align-items:flex-start;gap:10px;padding:12px;flex-wrap:wrap}.screenshot-viewer-stage{padding:6px}.screenshot-viewer-controls{margin-left:auto}}
    @media(prefers-reduced-motion:reduce){.screenshot-viewer[open]{animation:none}}
  `;
  document.head.append(style);
  const viewer = document.createElement('dialog');
  viewer.id='screenshot-viewer';viewer.className='screenshot-viewer';viewer.setAttribute('aria-labelledby','screenshot-viewer-title');
  viewer.innerHTML='<header><h2 id="screenshot-viewer-title">Full-size screenshot</h2><div class="screenshot-viewer-controls"><button type="button" id="screenshot-viewer-zoom" aria-pressed="false">Actual size</button><button type="button" id="screenshot-viewer-close" aria-label="Close screenshot">Close ×</button></div></header><div class="screenshot-viewer-stage"><img alt=""></div><p class="screenshot-viewer-status" role="status">Loading screenshot…</p>';
  document.body.append(viewer);
  const image=viewer.querySelector('img');
  const title=viewer.querySelector('h2');
  const status=viewer.querySelector('[role="status"]');
  const zoom=viewer.querySelector('#screenshot-viewer-zoom');
  const close=viewer.querySelector('#screenshot-viewer-close');
  let trigger, previousOverflow;
  function setZoom(original) {viewer.classList.toggle('is-original',original);zoom.setAttribute('aria-pressed',String(original));zoom.textContent=original?'Fit to window':'Actual size';}
  image.addEventListener('load',()=>{status.textContent='Full-size image · '+image.naturalWidth+' × '+image.naturalHeight+' · Press Esc or Close to return.';zoom.disabled=false;});
  image.addEventListener('error',()=>{status.textContent='This screenshot could not be loaded. Close the viewer and try again.';zoom.disabled=true;});
  close.addEventListener('click',()=>viewer.close());
  viewer.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
  zoom.addEventListener('click',()=>setZoom(!viewer.classList.contains('is-original')));
  viewer.addEventListener('click',event=>{if(event.target!==viewer)return;const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();});
  viewer.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;image.removeAttribute('src');setZoom(false);if(trigger?.isConnected)trigger.focus({preventScroll:true});});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link || !link.closest('main') || link.hasAttribute('download') || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
    const url=new URL(link.href,location.href);
    if(!/^https?:$/.test(url.protocol)||!/\.(png|jpe?g|webp|gif|avif)$/i.test(url.pathname))return;
    event.preventDefault();
    const figure=link.closest('figure');
    const preview=figure?.querySelector('img')||link.querySelector('img');
    const caption=figure?.querySelector('h4,h3,figcaption strong');
    title.textContent=caption?.textContent.trim()||preview?.alt||'Full-size screenshot';
    image.alt=preview?.alt||title.textContent;
    trigger=link;previousOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';setZoom(false);status.textContent='Loading screenshot…';zoom.disabled=true;
    viewer.showModal();image.src=url.href;close.focus();
  });
})();
