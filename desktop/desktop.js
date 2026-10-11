'use strict';
(() => {
  const icons = {
    terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 9h18"/>',
    network: '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="2" y="16" width="7" height="6" rx="1"/><rect x="15" y="16" width="7" height="6" rx="1"/><path d="M12 8v4M5.5 16v-4h13v4"/>',
    shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
    file: '<path d="M14 2H5v20h14V7Z"/><path d="M14 2v6h5M8 12h8m-8 4h6"/>',
    mail: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 6 10 7L22 6"/>',
    github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-2-.8-3 3-.3 6-1.3 6-6A5 5 0 0 0 19 5.5 5 5 0 0 0 18.8 2S17.5 1.6 15 3.4a13 13 0 0 0-6 0C6.5 1.6 5.2 2 5.2 2A5 5 0 0 0 5 5.5 5 5 0 0 0 3.8 9c0 4.7 3 5.7 6 6-.9 1-1 2-1 3v4"/>',
    settings: '<path d="m10 2 4 0 .8 3 2 .9 2.8-.9 2 3.5-2 2.2v2.6l2 2.2-2 3.5-2.8-.9-2 .9L14 22h-4l-.8-3-2-.9-2.8.9-2-3.5 2-2.2v-2.6l-2-2.2 2-3.5 2.8.9 2-.9Z"/><circle cx="12" cy="12" r="3"/>',
    pin: '<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    volume: '<path d="M11 4 6 8H2v8h4l5 4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 0-10 6 6 0 0 1 11-1 5 5 0 1 1 1 11Z"/>',
  };
  const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.folder}</svg>`;
  function populateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = svg(el.dataset.icon); }); }
  populateIcons();
  const desktop = document.getElementById('workspace');
  const layer = document.getElementById('windows');
  const mobile = window.matchMedia('(max-width:700px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
  // A lightweight halo complements the native pointer without intercepting input.
  const mousePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  const cursorHalo = document.createElement('div');
  cursorHalo.className = 'cursor-halo';
  cursorHalo.setAttribute('aria-hidden', 'true');
  cursorHalo.innerHTML = '<span class="cursor-halo-ring"></span>';
  document.body.appendChild(cursorHalo);
  let cursorFrame = 0;
  let cursorPosition;
  function hideCursorHalo() {
    cursorHalo.classList.remove('is-visible', 'is-hovering', 'is-pressed');
    cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    cursorPosition = null;
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !mousePointer.matches || reducedMotion.matches) {
      hideCursorHalo();
      return;
    }
    cursorPosition = { x: event.clientX, y: event.clientY };
    cursorHalo.classList.toggle('is-hovering', Boolean(event.target.closest('a,button,input,textarea,select,.titlebar,.guide-widget header')));
    if (cursorFrame) return;
    cursorFrame = requestAnimationFrame(() => {
      cursorFrame = 0;
      cursorHalo.style.transform = 'translate3d(' + cursorPosition.x + 'px,' + cursorPosition.y + 'px,0)';
      cursorHalo.classList.add('is-visible');
    });
  }, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && cursorHalo.classList.contains('is-visible')) cursorHalo.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointerup', () => cursorHalo.classList.remove('is-pressed'), { passive: true });
  document.addEventListener('pointercancel', hideCursorHalo);
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hideCursorHalo(); });
  window.addEventListener('blur', hideCursorHalo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideCursorHalo(); });
  mousePointer.addEventListener('change', hideCursorHalo);
  reducedMotion.addEventListener('change', hideCursorHalo);

  // Desktop selection begins only on empty wallpaper, never inside an app.
  const selectionBox = document.createElement('div');
  selectionBox.className = 'desktop-selection-box';
  selectionBox.hidden = true;
  selectionBox.setAttribute('aria-hidden', 'true');
  desktop.appendChild(selectionBox);
  const shortcuts = [...document.querySelectorAll('.desktop-icons button, .desktop-icons a')];
  let desktopSelection;
  function clearDesktopSelection() {
    shortcuts.forEach(shortcut => shortcut.classList.remove('is-selected'));
  }
  function selectionPoint(event) {
    const bounds = desktop.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(event.clientX - bounds.left, bounds.width)),
      y: Math.max(0, Math.min(event.clientY - bounds.top, bounds.height)),
    };
  }
  desktop.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.pointerType !== 'mouse' ||
        event.target.closest('.window, .guide-widget, .profile-widget, .ambient-widget, button, a, input, textarea, select')) return;
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    const point = selectionPoint(event);
    const keepSelection = event.ctrlKey || event.metaKey || event.shiftKey;
    if (!keepSelection) clearDesktopSelection();
    desktopSelection = { ...point, pointerId: event.pointerId, previous: new Set(keepSelection ? shortcuts.filter(shortcut => shortcut.classList.contains('is-selected')) : []) };
    desktop.setPointerCapture(event.pointerId);
    desktop.classList.add('is-selecting');
    Object.assign(selectionBox.style, { left: point.x + 'px', top: point.y + 'px', width: '0px', height: '0px' });
  });
  desktop.addEventListener('pointermove', event => {
    if (!desktopSelection || event.pointerId !== desktopSelection.pointerId) return;
    const point = selectionPoint(event);
    const left = Math.min(point.x, desktopSelection.x);
    const top = Math.min(point.y, desktopSelection.y);
    const width = Math.abs(point.x - desktopSelection.x);
    const height = Math.abs(point.y - desktopSelection.y);
    selectionBox.hidden = width < 3 && height < 3;
    Object.assign(selectionBox.style, { left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px' });
    const bounds = desktop.getBoundingClientRect();
    shortcuts.forEach(shortcut => {
      const box = shortcut.getBoundingClientRect();
      const intersects = box.width > 0 && box.height > 0 && width > 3 && height > 3 &&
        box.right > bounds.left + left && box.left < bounds.left + left + width &&
        box.bottom > bounds.top + top && box.top < bounds.top + top + height;
      shortcut.classList.toggle('is-selected', intersects || desktopSelection.previous.has(shortcut));
    });
  });
  function stopDesktopSelection() {
    if (!desktopSelection) return;
    const pointerId = desktopSelection.pointerId;
    desktopSelection = null;
    selectionBox.hidden = true;
    desktop.classList.remove('is-selecting');
    if (desktop.hasPointerCapture(pointerId)) desktop.releasePointerCapture(pointerId);
  }
  desktop.addEventListener('pointerup', stopDesktopSelection);
  desktop.addEventListener('pointercancel', stopDesktopSelection);
  desktop.addEventListener('lostpointercapture', stopDesktopSelection);
  window.addEventListener('blur', stopDesktopSelection);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { stopDesktopSelection(); clearDesktopSelection(); }
  });

  const windows = new Map();
  let front = 20;
  let lastFocused;
  let toastTimer;
  const preferenceKey = 'dallas-workspace-preferences';
  let preferences = { rain: !reducedMotion.matches, dim: false };
  try { preferences = { ...preferences, ...JSON.parse(localStorage.getItem(preferenceKey) || '{}') }; } catch (_) {}
  function notify(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  }
  const projectData = {
    network: {
      title: 'Cisco Enterprise Network', label: 'NETWORKS / PACKET TRACER', icon: 'network',
      summary: 'A simulated enterprise network with VLAN segmentation, Layer 3 switching, OSPF routing, DHCP, NAT/PAT, EtherChannel, and connectivity tests.',
      tools: ['Cisco IOS', 'Packet Tracer', 'VLANs', 'OSPF', 'LACP', 'DHCP', 'NAT/PAT'],
      points: ['Configured VLANs, SVIs and 802.1Q trunks.', 'Bundled links using LACP EtherChannel.', 'Verified OSPF adjacency, DHCP bindings and NAT translations.', 'Documented successful and blocked connectivity tests, including remaining ACL verification gaps.'],
      image: '/images/Topology.png', caption: 'The documented Packet Tracer topology. This is a lab simulation.', path: '/projects/network/', count: '11 screenshots',
    },
    directory: {
      title: 'Active Directory Home Lab', label: 'SYSTEMS / WINDOWS SERVER', icon: 'network',
      summary: 'A virtual Windows domain built with Hyper-V, Windows Server 2022, and a domain-joined Windows 11 client. The documentation covers identity, policy, file sharing and remote administration.',
      tools: ['Hyper-V', 'Windows Server', 'Active Directory', 'DNS', 'Group Policy', 'Windows 11'],
      points: ['Built the virtual domain environment and joined a Windows client.', 'Practiced user and organizational unit administration.', 'Configured and tested Group Policy and shared-folder access.', 'Documented drive mapping and remote access.'],
      path: '/projects/active-directory/', count: 'Lab walkthrough',
    },
    azure: {
      title: 'Azure Identity & Governance', label: 'CLOUD / MICROSOFT AZURE', icon: 'cloud',
      summary: 'An Azure learning environment focused on Microsoft Entra ID, group-based access at resource-group scope, and subscription cost monitoring.',
      tools: ['Microsoft Azure', 'Entra ID', 'RBAC', 'Resource groups', 'Cost Management'],
      points: ['Created four lab identities with different functions.', 'Organized cloud administrators, VM operators and read-only auditors into security groups.', 'Assigned Reader and Virtual Machine Contributor roles at resource-group scope.', 'Configured a $25 monthly budget with alerts at 50%, 80% and 100%.'],
      image: '/images/azure-resource-iam.webp', caption: 'Role assignments at resource-group scope. The full write-up explains inherited subscription Owner access.', path: '/projects/azure/', count: '7 images + video',
    },
  };
  const apps = {
    about: { title: 'About_Dallas.md', icon: 'user', width: 560, height: 700, x: .08, y: .08, status: 'PROFILE / ABOUT ME', content: () => `
      <div class="about-banner"></div>
      <div class="about-heading"><img src="/desktop/assets/headshot.webp" alt="Dallas Deas" width="61" height="61"><div><h1 class="glitch" data-text="Dallas Deas">Dallas Deas</h1><p>IT support · Networking · Systems</p></div></div>
      <div class="about-body"><span class="eyebrow">THE PERSON BEHIND THE WORKSPACE</span>
        <p class="body-text">I'm Dallas, an IT professional based in <strong>Atlanta, Georgia</strong>. I work across end-user support and business systems, and I'm building deeper skills in networking, systems administration and cloud infrastructure.</p>
        <p class="body-text">This workspace brings together the labs I've built, the problems I've investigated, and the technical work I've documented.</p>
        <div class="about-focus"><span class="eyebrow">WHAT I WORK WITH</span><div class="focus-grid"><span>Networks & routing</span><span>Windows & identity</span><span>Cloud fundamentals</span><span>Technical support</span></div></div>
        <div class="action-row"><button class="action" data-app="projects">Explore projects <span>↗</span></button><button class="outline-action" data-app="resume">View résumé <span>→</span></button></div>
      </div>` },
    terminal: { title: 'Terminal — dallas@workspace', icon: 'terminal', width: 640, height: 540, x: .94, y: .22, status: 'LOCAL PORTFOLIO TERMINAL', content: () => `
      <div class="terminal-content"><p class="terminal-welcome">Dallas Workspace <b>[Version 2026.10]</b><br>Type <b>help</b> to explore. Welcome in.</p>
        <div class="terminal-logo" aria-hidden="true">D A L L A S / D E A S<br>─────────────────────</div>
        <dl class="terminal-facts"><dt>user</dt><dd>Dallas Deas</dd><dt>location</dt><dd>Atlanta, Georgia</dd><dt>focus</dt><dd>IT support, networking & systems</dd><dt>credentials</dt><dd>CCNA · Security+ · AZ-900</dd><dt>projects</dt><dd>Active Directory / Cisco / Azure</dd><dt>status</dt><dd>Open to IT opportunities</dd></dl>
        <div class="terminal-history" role="log" aria-live="polite"></div>
        <form class="terminal-form"><label class="prompt" for="terminal-input">dallas@workspace:~$</label><input id="terminal-input" aria-label="Terminal command" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="200"></form>
        <div class="terminal-help">try: help · projects · about · contact</div>
      </div>` },
    projects: { title: 'Projects — File Explorer', icon: 'folder', width: 640, height: 450, x: .48, y: .13, status: '3 PROJECT FOLDERS', content: () => `
      <div class="window-toolbar"><span>⌂ / home / dallas / projects</span><span>3 items</span></div>
      <div class="folder-grid">${Object.entries(projectData).map(([id, project]) => `<button class="folder" data-app="project-${id}"><span class="folder-icon">${svg('folder')}</span><strong>${project.title}</strong><small>${project.count}</small></button>`).join('')}</div>
      <div class="folder-bottom"><b>Technical work, documented.</b><br>Open a folder to see what I configured, tested, and learned. Each project links to its full lab documentation.</div>` },
    skills: { title: 'Toolbox — skills.json', icon: 'network', width: 590, height: 560, x: .55, y: .16, status: 'TOOLS USED IN WORK & LABS', content: () => `
      <div class="detail-content">${Object.entries({ Networking: ['Cisco IOS', 'TCP/IP', 'VLANs', 'OSPF', 'DHCP', 'NAT/PAT', 'LACP', 'SSH'], Systems: ['Windows Server', 'Active Directory', 'Group Policy', 'Hyper-V', 'Windows support'], Cloud: ['Microsoft Azure', 'Entra ID', 'RBAC', 'Cost Management'], 'Business tools': ['Excel', 'Power Query', 'ERP workflows', 'IT asset tracking'] }).map(([label, skills]) => `<section class="skills-group"><h3>${label.toUpperCase()}</h3><div class="pill-row">${skills.map(skill => `<span class="pill">${skill}</span>`).join('')}</div></section>`).join('')}</div>` },
    certifications: { title: 'Credentials — verified learning', icon: 'shield', width: 600, height: 560, x: .45, y: .14, status: 'NETWORKING / SECURITY / CLOUD', content: () => `
      <div class="detail-content"><div class="credential"><span class="credential-icon">${svg('network')}</span><div><h3>Cisco Certified Network Associate</h3><p>CCNA · Routing, switching, IP services and network fundamentals.</p><small>Certified June 2026</small></div></div><div class="credential"><span class="credential-icon">${svg('shield')}</span><div><h3>CompTIA Security+</h3><p>Security fundamentals, threats, risk, defensive controls and identity.</p><small>Certified October 2025</small></div></div><div class="credential"><span class="credential-icon">${svg('cloud')}</span><div><h3>Microsoft Azure Fundamentals</h3><p>AZ-900 · Cloud concepts, Azure services, governance and pricing.</p><small>Certified</small></div></div><div class="action-row"><button class="action" data-app="projects">See the hands-on work ↗</button></div></div>` },
    contact: { title: 'Contact.txt', icon: 'mail', width: 580, height: 510, x: .6, y: .16, status: 'LET’S CONNECT', content: () => `
      <div class="detail-content"><span class="eyebrow">HAVE A ROLE IN MIND?</span><h2>Let's connect.</h2><p class="body-text">I'm interested in IT support, junior networking, infrastructure support and systems operations opportunities.</p><a class="contact-address" href="mailto:dallasjdeas03@gmail.com">dallasjdeas03@gmail.com ↗</a><div class="action-row" style="margin:0 0 22px"><button class="action" id="copy-email">Copy email <span>⧉</span></button></div><div class="contact-card"><span>LinkedIn</span><a href="https://www.linkedin.com/in/dallas-deas" target="_blank" rel="noopener noreferrer">dallas-deas ↗</a></div><div class="contact-card"><span>GitHub</span><a href="https://github.com/DallasDeas" target="_blank" rel="noopener noreferrer">DallasDeas ↗</a></div></div>` },
    resume: { title: 'Dallas_Deas_Resume.pdf', icon: 'file', width: 800, height: 760, x: .5, y: .045, status: 'RÉSUMÉ / PDF', content: () => `
      <div class="resume-toolbar"><span>Dallas Deas / Résumé</span><a href="/desktop/assets/Dallas_Deas_Resume.pdf" target="_blank" rel="noopener noreferrer">Open PDF ↗</a><a href="/desktop/assets/Dallas_Deas_Resume.pdf" download="Dallas_Deas_Resume.pdf">Download ↓</a></div><div class="resume-preview"><img src="/desktop/assets/resume-preview.webp" alt="Dallas Deas résumé, page 1. Open or download the original PDF using the toolbar links."><img src="/desktop/assets/resume-preview-2.webp" alt="Dallas Deas résumé, page 2."></div>` },
    settings: { title: 'Appearance — workspace settings', icon: 'settings', width: 510, height: 420, x: .6, y: .16, status: 'PREFERENCES SAVED ON THIS DEVICE', content: () => `
      <div class="detail-content"><span class="eyebrow">MAKE YOURSELF AT HOME</span><div class="settings-row"><div><strong>Animated rain</strong><small>Atmosphere over the skyline.<br>Respects reduced motion settings.</small></div><button class="switch" data-preference="rain" aria-label="Animated rain" aria-pressed="${preferences.rain && !reducedMotion.matches}"><span></span></button></div><div class="settings-row"><div><strong>Dim the wallpaper</strong><small>A quieter background for reading.</small></div><button class="switch" data-preference="dim" aria-label="Dim the wallpaper" aria-pressed="${preferences.dim}"><span></span></button></div><div class="action-row"><button class="outline-action" id="reset-workspace">Reset window layout ↺</button></div></div>` },
  };
  Object.entries(projectData).forEach(([id, project]) => {
    apps[`project-${id}`] = { title: `${project.title} — Lab notes`, icon: project.icon, width: 730, height: 690, x: .48, y: .08, status: 'HANDS-ON LAB / DOCUMENTED', content: () => `<div class="detail-content"><span class="eyebrow">${project.label}</span><h2>${project.title}</h2><p class="body-text">${project.summary}</p><div class="pill-row">${project.tools.map(tool => `<span class="pill">${tool}</span>`).join('')}</div><h3>WHAT I CONFIGURED & TESTED</h3><ul class="detail-list">${project.points.map(point => `<li>${point}</li>`).join('')}</ul>${project.image ? `<a href="${project.image}" target="_blank" rel="noopener noreferrer"><img class="evidence-image" src="${project.image}" alt="${project.caption}" loading="lazy"></a><div class="evidence-caption">${project.caption}</div>` : ''}<div class="action-row"><a class="action" href="${project.path}" target="_blank" rel="noopener noreferrer">Read full lab documentation ↗</a><button class="outline-action" data-app="projects">All projects →</button></div></div>` };
  });
  function updateDock() {
    document.querySelectorAll('[data-app]').forEach(button => {
      const state = windows.get(button.dataset.app);
      button.classList.toggle('is-open', Boolean(state));
      if (button.closest('.dock')) button.setAttribute('aria-pressed', String(Boolean(state && !state.el.hidden)));
    });
  }
  function focusWindow(state) {
    windows.forEach(other => {
      other.el.classList.remove('is-focused');
      other.el.inert = mobile.matches && other !== state;
    });
    state.el.style.zIndex = ++front;
    state.el.classList.add('is-focused');
    lastFocused = state;
  }
  function fitWindow(el) {
    if (mobile.matches || el.classList.contains('is-maximized')) return;
    const w = desktop.clientWidth;
    const h = desktop.clientHeight;
    const width = Math.min(el.offsetWidth, w - 24);
    const height = Math.min(el.offsetHeight, h - 100);
    el.style.width = width + 'px';
    el.style.height = height + 'px';
    el.style.left = Math.max(12, Math.min(parseFloat(el.style.left) || 12, w - width - 12)) + 'px';
    el.style.top = Math.max(12, Math.min(parseFloat(el.style.top) || 12, h - height - 100)) + 'px';
  }
  function openApp(id, focus = true) {
    if (!apps[id]) return;
    if (windows.has(id)) {
      const state = windows.get(id);
      state.el.hidden = false;
      focusWindow(state);
      updateDock();
      if (focus) focusApp(state);
      return;
    }
    const app = apps[id];
    const el = document.createElement('section');
    el.className = 'window';
    el.dataset.window = id;
    el.setAttribute('role', 'region');
    el.setAttribute('aria-labelledby', `title-${id}`);
    el.style.width = app.width + 'px';
    el.style.height = Math.min(app.height, desktop.clientHeight - 112) + 'px';
    el.style.left = Math.round(12 + Math.max(0, desktop.clientWidth - app.width - 24) * app.x) + 'px';
    el.style.top = Math.round(desktop.clientHeight * app.y) + 'px';
    el.innerHTML = `<header class="titlebar"><div class="window-controls"><button class="control-close" aria-label="Close ${app.title}" title="Close">×</button><button class="control-minimize" aria-label="Minimize ${app.title}" title="Minimize">−</button><button class="control-maximize" aria-label="Maximize ${app.title}" title="Maximize">+</button></div><span class="window-title" id="title-${id}"><span class="title-icon">${svg(app.icon)}</span>${app.title}</span><span class="window-id">D / ${String(Object.keys(apps).indexOf(id) + 1).padStart(2,'0')}</span></header><div class="window-content">${app.content()}</div><footer class="window-status"><span>${app.status}</span><span>Dallas Deas</span></footer>`;
    layer.append(el);
    const state = { id, el, commands: [], historyIndex: 0, previousGeometry: null, trigger: document.activeElement };
    windows.set(id, state);
    el.addEventListener('pointerdown', () => focusWindow(state));
    el.addEventListener('focusin', () => { if (lastFocused !== state) focusWindow(state); });
    el.querySelector('.control-close').addEventListener('click', () => closeApp(id));
    el.querySelector('.control-minimize').addEventListener('click', () => {
      el.hidden = true;
      updateDock();
      const next = [...windows.values()].filter(other => !other.el.hidden).sort((a,b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
      if (next) focusWindow(next); else lastFocused = undefined;
      (document.querySelector(`.dock [data-app="${id}"]`) || document.querySelector('.dock [data-app="projects"]'))?.focus();
    });
    el.querySelector('.control-maximize').addEventListener('click', () => maximize(state));
    const bar = el.querySelector('.titlebar');
    bar.addEventListener('dblclick', e => { if (!e.target.closest('button')) maximize(state); });
    let drag;
    bar.addEventListener('pointerdown', e => {
      if (mobile.matches || e.target.closest('button') || el.classList.contains('is-maximized') || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => {
      if (!drag) return;
      el.style.left = Math.max(0, Math.min(desktop.clientWidth - el.offsetWidth, drag.left + e.clientX - drag.x)) + 'px';
      el.style.top = Math.max(0, Math.min(desktop.clientHeight - 130, drag.top + e.clientY - drag.y)) + 'px';
    });
    const stopDrag = () => { drag = null; };
    bar.addEventListener('pointerup', stopDrag);
    bar.addEventListener('pointercancel', stopDrag);
    if (id === 'terminal') setupTerminal(state);
    if (id === 'contact') el.querySelector('#copy-email').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText('dallasjdeas03@gmail.com'); notify('Email copied to clipboard'); } catch (_) { notify('Copy unavailable. Select the email address to copy it.'); }
    });
    if (id === 'settings') {
      el.querySelectorAll('[data-preference]').forEach(button => button.addEventListener('click', () => {
        const key = button.dataset.preference;
        if (key === 'rain' && reducedMotion.matches) { notify('Rain is off because your device prefers reduced motion.'); return; }
        preferences[key] = !preferences[key];
        button.setAttribute('aria-pressed', String(preferences[key]));
        applyPreferences();
      }));
      el.querySelector('#reset-workspace').addEventListener('click', resetWorkspace);
    }
    fitWindow(el);
    focusWindow(state);
    updateDock();
    if (focus) focusApp(state);
  }
  function focusApp(state) { (state.el.querySelector('.terminal-form input') || state.el.querySelector('.control-close')).focus({ preventScroll: true }); }
  function closeApp(id) {
    const state = windows.get(id);
    if (!state) return;
    state.el.remove();
    windows.delete(id);
    updateDock();
    if (lastFocused === state) lastFocused = undefined;
    const next = [...windows.values()].filter(other => !other.el.hidden).sort((a,b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
    if (next) { focusWindow(next); focusApp(next); }
    else (state.trigger?.isConnected ? state.trigger : document.querySelector(`[data-app="${id}"]`))?.focus();
  }
  function maximize(state) {
    const el = state.el;
    const button = el.querySelector('.control-maximize');
    if (el.classList.contains('is-maximized')) {
      el.classList.remove('is-maximized');
      Object.assign(el.style, state.previousGeometry);
      button.setAttribute('aria-label', `Maximize ${apps[state.id].title}`);
      button.title = 'Maximize';
      fitWindow(el);
    } else {
      state.previousGeometry = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      el.classList.add('is-maximized');
      button.setAttribute('aria-label', `Restore ${apps[state.id].title}`);
      button.title = 'Restore';
    }
  }
  function resetWorkspace() {
    windows.forEach(state => state.el.remove());
    windows.clear();
    lastFocused = undefined;
    openApp('terminal', false);
    openApp('about', false);
    notify('Workspace layout reset');
  }
  document.addEventListener('click', e => { const button = e.target.closest('[data-app]'); if (button) openApp(button.dataset.app); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!document.getElementById('guide-widget').hidden) setGuide(false); else if (lastFocused && !lastFocused.el.hidden) closeApp(lastFocused.id); } });
  window.addEventListener('resize', () => {
    windows.forEach(state => fitWindow(state.el));
    if (lastFocused && !lastFocused.el.hidden) focusWindow(lastFocused);
  });
  function setupTerminal(state) {
    const form = state.el.querySelector('.terminal-form');
    const input = form.querySelector('input');
    const history = state.el.querySelector('.terminal-history');
    const content = state.el.querySelector('.window-content');
    const append = (text, className) => { const line = document.createElement('p'); line.className = 'terminal-line ' + className; line.textContent = text; history.append(line); };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      state.commands.push(raw);
      state.historyIndex = state.commands.length;
      append('dallas@workspace:~$ ' + raw, 'terminal-command');
      const [command, ...args] = raw.toLowerCase().split(/\s+/);
      const commandApps = { about:'about', projects:'projects', skills:'skills', certs:'certifications', certifications:'certifications', resume:'resume', contact:'contact' };
      if (command === 'clear') history.replaceChildren();
      else if (command === 'help') append('Available commands:\n  about       Meet Dallas\n  projects    Open the lab folders\n  skills      Explore the toolbox\n  certs       View credentials\n  resume      Open the résumé\n  contact     Find contact details\n  open <app>  Open a workspace app\n  ls          List portfolio folders\n  whoami      Show profile\n  date        Show current time\n  clear       Clear this history\n\nUse ↑ / ↓ for command history.', 'terminal-output');
      else if (command === 'whoami') append('Dallas Deas\nIT support · Networking · Systems\nAtlanta, Georgia\nCCNA · CompTIA Security+ · Azure Fundamentals', 'terminal-output');
      else if (command === 'ls') append('about.md  projects/  skills.json  credentials/\nresume.pdf  contact.txt\n\nprojects/: active-directory/  cisco-network/  azure/', 'terminal-output');
      else if (command === 'pwd') append('/home/dallas/workspace', 'terminal-output');
      else if (command === 'date') append(new Date().toLocaleString('en-US', { timeZone:'America/New_York', timeZoneName:'short' }), 'terminal-output');
      else if (commandApps[command]) { append('Opening ' + command + '…', 'terminal-output'); openApp(commandApps[command]); }
      else if (command === 'open') {
        const aliases = { ...commandApps, settings:'settings', terminal:'terminal', network:'project-network', azure:'project-azure', directory:'project-directory' };
        const id = aliases[args[0]];
        if (id) { append('Opening ' + args[0] + '…', 'terminal-output'); openApp(id); }
        else append('Choose an app: about, projects, skills, certs, resume, contact, settings, network, azure, directory.', 'terminal-output');
      } else append(`Command not found: ${command}. Type help for available commands.`, 'terminal-output');
      content.scrollTop = content.scrollHeight;
    });
    input.addEventListener('keydown', e => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      state.historyIndex = Math.max(0, Math.min(state.commands.length, state.historyIndex + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = state.commands[state.historyIndex] || '';
    });
    state.el.querySelector('.terminal-content').addEventListener('click', e => { if (!e.target.closest('a,button') && !window.getSelection().toString()) input.focus(); });
  }
  function applyPreferences() {
    document.body.classList.toggle('calm-mode', preferences.dim);
    document.getElementById('rain').hidden = !preferences.rain || reducedMotion.matches;
    try { localStorage.setItem(preferenceKey, JSON.stringify(preferences)); } catch (_) {}
    updateRain();
  }
  let rainFrame;
  let lastRainTime = 0;
  const canvas = document.getElementById('rain');
  const ctx = canvas.getContext('2d');
  let drops = [];
  function sizeRain() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    drops = Array.from({ length: mobile.matches ? 45 : 95 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, length: 12 + Math.random()*38, speed: 250 + Math.random()*350, alpha: .1+Math.random()*.3 }));
  }
  function drawRain(time) {
    if (document.hidden || canvas.hidden) { rainFrame = null; return; }
    const delta = Math.min((time-lastRainTime)/1000 || .016, .05);
    lastRainTime = time;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    drops.forEach(drop => {
      drop.y += drop.speed*delta; drop.x -= drop.speed*.035*delta;
      if (drop.y > innerHeight+drop.length) { drop.y = -drop.length; drop.x = Math.random()*innerWidth; }
      ctx.strokeStyle = `rgba(168,195,233,${drop.alpha})`;
      ctx.lineWidth = .7;
      ctx.beginPath();ctx.moveTo(drop.x,drop.y);ctx.lineTo(drop.x+1.5,drop.y-drop.length);ctx.stroke();
    });
    rainFrame = requestAnimationFrame(drawRain);
  }
  function updateRain() {
    if (!ctx) return;
    cancelAnimationFrame(rainFrame);
    rainFrame = null;
    if (!canvas.hidden && !document.hidden) { lastRainTime = performance.now(); rainFrame = requestAnimationFrame(drawRain); }
  }
  if (ctx) { sizeRain(); window.addEventListener('resize', sizeRain); document.addEventListener('visibilitychange', updateRain); }
  reducedMotion.addEventListener('change', () => { applyPreferences(); const button = document.querySelector('[data-preference="rain"]'); button?.setAttribute('aria-pressed', String(preferences.rain && !reducedMotion.matches)); });
  applyPreferences();
  function updateClock() { document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-US', { timeZone:'America/New_York', hour:'2-digit', minute:'2-digit' }) + ' ET'; }
  updateClock();setInterval(updateClock, 30000);
  let audio;
  let audioSource;
  let volume;
  let playing = false;
  const soundButton = document.getElementById('sound-toggle');
  const soundVolume = document.getElementById('sound-volume');
  soundButton.addEventListener('click', async () => {
    try {
      if (!audio) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Audio unavailable');
        audio = new Audio();
        const buffer = audio.createBuffer(1, audio.sampleRate*4, audio.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i=0;i<data.length;i++) { last = (last + Math.random()*2-1) / 1.035; data[i] = last*.14; }
        audioSource = audio.createBufferSource();audioSource.buffer=buffer;audioSource.loop=true;
        const filter = audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1800;
        volume = audio.createGain();volume.gain.value=0;
        audioSource.connect(filter);filter.connect(volume);volume.connect(audio.destination);audioSource.start();
      }
      await audio.resume();
      playing = !playing;
      volume.gain.setTargetAtTime(playing ? Number(soundVolume.value)/100 : 0, audio.currentTime, .25);
      soundButton.setAttribute('aria-pressed', String(playing));
      soundButton.setAttribute('aria-label', playing ? 'Pause ambient rain' : 'Play ambient rain');
      soundButton.title = playing ? 'Pause ambient rain' : 'Play ambient rain';
      document.body.classList.toggle('sound-playing', playing);
    } catch (_) { notify('Ambient audio is unavailable in this browser.'); }
  });
  soundVolume.addEventListener('input', () => { if (playing && volume) volume.gain.setTargetAtTime(Number(soundVolume.value)/100,audio.currentTime,.1); });
  const guide = document.getElementById('guide-widget');
  const guideToggle = document.getElementById('guide-toggle');
  const guideHeader = guide.querySelector('header');
  guideHeader.tabIndex = 0;
  guideHeader.setAttribute('aria-label', 'Move portfolio guide. Drag or use arrow keys.');
  guideHeader.title = 'Drag to move · Arrow keys to move';
  let guideDrag;
  let guideMoved = false;
  function positionGuide(left, top) {
    const width = Math.min(guide.offsetWidth, desktop.clientWidth - 24);
    guide.style.width = width + 'px';
    guide.style.right = 'auto';
    guide.style.bottom = 'auto';
    guide.style.left = Math.max(12, Math.min(left, desktop.clientWidth - width - 12)) + 'px';
    guide.style.top = Math.max(12, Math.min(top, desktop.clientHeight - guide.offsetHeight - 96)) + 'px';
    guideMoved = true;
  }
  guideHeader.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    guideDrag = { x: event.clientX, y: event.clientY, left: guide.offsetLeft, top: guide.offsetTop };
    guideHeader.setPointerCapture(event.pointerId);
    guideHeader.classList.add('is-dragging');
  });
  guideHeader.addEventListener('pointermove', event => {
    if (!guideDrag) return;
    positionGuide(guideDrag.left + event.clientX - guideDrag.x, guideDrag.top + event.clientY - guideDrag.y);
  });
  function stopGuideDrag() {
    guideDrag = null;
    guideHeader.classList.remove('is-dragging');
  }
  guideHeader.addEventListener('pointerup', stopGuideDrag);
  guideHeader.addEventListener('pointercancel', stopGuideDrag);
  guideHeader.addEventListener('lostpointercapture', stopGuideDrag);
  guideHeader.addEventListener('keydown', event => {
    if (event.target !== guideHeader) return;
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 30 : 10;
    positionGuide(guide.offsetLeft + direction[0] * step, guide.offsetTop + direction[1] * step);
  });
  window.addEventListener('resize', () => {
    if (guideMoved && !guide.hidden) positionGuide(guide.offsetLeft, guide.offsetTop);
  });

  function setGuide(open) {
    guide.hidden = !open;
    if (open && guideMoved) positionGuide(guide.offsetLeft, guide.offsetTop);
    guideToggle.setAttribute('aria-expanded',String(open));
    guideToggle.classList.toggle('is-open',open);
    if (open) document.getElementById('guide-input').focus(); else guideToggle.focus();
  }
  guideToggle.addEventListener('click', () => setGuide(guide.hidden));
  document.getElementById('guide-close').addEventListener('click', () => setGuide(false));
  function answerGuide(question) {
    const log = document.getElementById('guide-messages');
    const questionEl = document.createElement('p');questionEl.className='guide-question';questionEl.textContent=question;log.append(questionEl);
    const text = question.toLowerCase();
    let reply = 'Try asking about projects, skills, credentials, the résumé, or contact details. You can also explore using the desktop icons.';
    let app;
    if (/azure|cloud/.test(text)) { app='project-azure';reply='The Azure lab covers Entra ID, group-based RBAC and cost monitoring. I’ve opened the lab overview.'; }
    else if (/active directory|domain|windows server/.test(text)) { app='project-directory';reply='The Active Directory lab covers a virtual Windows domain, users, Group Policy, file shares and remote access. I’ve opened it.'; }
    else if (/network|cisco/.test(text)) { app='project-network';reply='The Cisco lab documents VLANs, OSPF, EtherChannel, DHCP, NAT and connectivity tests. I’ve opened the overview.'; }
    else if (/project|lab/.test(text)) { app='projects';reply='Dallas has documented Active Directory, Cisco networking and Azure identity labs. Open a folder for an overview and the full documentation.'; }
    else if (/skill|tool/.test(text)) { app='skills';reply='His toolbox includes Cisco IOS, Windows Server, Active Directory, Azure, Entra ID, Excel and Power Query. I’ve opened the full list.'; }
    else if (/cert|credential/.test(text)) { app='certifications';reply='Dallas holds CCNA, CompTIA Security+ and Microsoft Azure Fundamentals. I’ve opened the credentials window.'; }
    else if (/resume|résumé|cv/.test(text)) { app='resume';reply='I’ve opened the résumé. You can view or download the PDF from its toolbar.'; }
    else if (/contact|email|hire|linkedin/.test(text)) { app='contact';reply='You can reach Dallas at dallasjdeas03@gmail.com or through LinkedIn. I’ve opened the contact details.'; }
    else if (/about|background|experience|who/.test(text)) { app='about';reply='Dallas is based in Atlanta and focuses on IT support, networking and systems, with experience supporting business applications and Windows environments.'; }
    const answer = document.createElement('p');answer.className='guide-response';answer.textContent=reply;log.append(answer);log.scrollTop=log.scrollHeight;
    if (app) openApp(app,false);
  }
  document.querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => answerGuide(button.dataset.guide)));
  document.getElementById('guide-form').addEventListener('submit', e => { e.preventDefault(); const input=document.getElementById('guide-input');const value=input.value.trim();if(value) answerGuide(value);input.value=''; });
  openApp('terminal', false);
  openApp('about', false);
})();
