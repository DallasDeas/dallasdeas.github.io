'use strict';
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
  const markerKey = 'dallas-view-transition';
  const style = document.createElement('style');
  style.textContent = `
    .view-transition{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;overflow:hidden;background:#0e1019;color:#e9eaf2;opacity:0;visibility:hidden;pointer-events:none}
    .view-transition.is-active{opacity:1;visibility:visible;pointer-events:auto}
    .view-transition::before{content:'';position:absolute;inset:-10%;background:repeating-linear-gradient(0deg,transparent 0 4px,#ffffff09 4px 5px);opacity:.5}
    .view-transition::after{content:'';position:absolute;inset:0;background:linear-gradient(transparent 18%,#f15a7030 18% 21%,transparent 21% 56%,#70dbf025 56% 59%,transparent 59% 84%,#f15a7024 84% 86%,transparent 86%);mix-blend-mode:screen}
    .view-transition-label{position:relative;font:600 clamp(15px,2vw,23px) 'IBM Plex Mono',monospace;letter-spacing:.2em;text-align:center;text-shadow:3px 0 #f15a70,-3px 0 #75d7ed;padding:24px}
    .view-transition-label small{display:block;font-size:10px;letter-spacing:.15em;color:#acafbf;margin-top:14px;text-shadow:none}
    .view-transition.is-leaving{animation:view-out 650ms ease-in both}
    .view-transition.is-leaving::after{animation:view-bands 650ms steps(1,end) both}
    .view-transition.is-leaving .view-transition-label{animation:view-label 650ms steps(1,end) both}
    .view-transition.is-entering{animation:view-in 450ms ease-out both}
    .view-transition.is-entering::after{animation:view-bands 450ms steps(1,end) both}
    .view-transition.is-entering .view-transition-label{animation:view-label 450ms steps(1,end) both}
    @keyframes view-out{0%{opacity:.85}18%{opacity:1}27%{opacity:.85}45%{opacity:1}58%{opacity:.9}100%{opacity:1}}
    @keyframes view-in{0%{opacity:1}35%{opacity:.8}52%{opacity:.94}100%{opacity:0}}
    @keyframes view-bands{0%,100%{transform:translateX(0)}20%{transform:translate(18px,-9%)}40%{transform:translate(-24px,12%)}60%{transform:translate(12px,-4%)}80%{transform:translate(-9px,7%)}}
    @keyframes view-label{0%,100%{transform:translateX(0);clip-path:inset(0)}20%{transform:translateX(-4px);clip-path:inset(4% 0 8%)}40%{transform:translateX(5px);clip-path:inset(0 0 18%)}60%{transform:translateX(-2px);clip-path:inset(12% 0 0)}80%{transform:translateX(2px);clip-path:inset(0)}}
    @media(prefers-reduced-motion:reduce){.view-transition{display:none!important}}
  `;
  document.head.appendChild(style);
  const overlay = document.createElement('div');
  overlay.className = 'view-transition';
  overlay.setAttribute('aria-hidden', 'true');
  const label = document.createElement('div');
  label.className = 'view-transition-label';
  overlay.appendChild(label);
  document.body.appendChild(overlay);
  let switching = false;
  let navigationTimer;
  let entranceTimer;
  function show(mode, destination) {
    label.replaceChildren(document.createTextNode(destination));
    const detail = document.createElement('small');
    detail.textContent = 'DALLAS DEAS / WORKSPACE';
    label.appendChild(detail);
    overlay.className = 'view-transition is-active ' + mode;
  }
  function clear() {
    clearTimeout(navigationTimer);
    clearTimeout(entranceTimer);
    switching = false;
    overlay.className = 'view-transition';
  }
  try {
    const marker = JSON.parse(sessionStorage.getItem(markerKey) || 'null');
    sessionStorage.removeItem(markerKey);
    if (marker && marker.path === location.pathname && Date.now() - marker.time < 8000 && !reducedMotion.matches) {
      show('is-entering', marker.label);
      entranceTimer = setTimeout(clear, 450);
    }
  } catch (_) {}
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reducedMotion.matches) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    const currentDesktop = location.pathname.startsWith('/desktop/');
    const destinationDesktop = url.pathname === '/desktop/';
    const destinationClassic = url.pathname === '/classic/';
    if (!(currentDesktop && destinationClassic) && !(!currentDesktop && destinationDesktop)) return;
    event.preventDefault();
    if (switching) return;
    clear();
    switching = true;
    const destination = destinationDesktop ? 'DESKTOP VIEW' : 'CLASSIC VIEW';
    show('is-leaving', destination);
    navigationTimer = setTimeout(() => {
      try { sessionStorage.setItem(markerKey, JSON.stringify({ path: url.pathname, label: destination, time: Date.now() })); } catch (_) {}
      location.assign(url.href);
    }, 650);
  }, { capture: true });
  window.addEventListener('pageshow', event => { if (event.persisted) clear(); });
})();
