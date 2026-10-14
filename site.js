const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();


// Show a clear placeholder until newly documented lab screenshots are uploaded.
document.querySelectorAll('.network-proof img').forEach(image => {
  const showUnavailable = () => {
    const imageLink = image.closest('.network-image-link');
    const figure = image.closest('.network-proof');
    if (!imageLink || !figure || imageLink.classList.contains('network-image-missing')) return;
    imageLink.classList.add('network-image-missing');
    imageLink.removeAttribute('href');
    imageLink.removeAttribute('target');
    imageLink.textContent = 'Screenshot awaiting upload to the images folder';
    figure.querySelectorAll('a.section-link').forEach(link => {
      link.hidden = true;
    });
  };
  image.addEventListener('error', showUnavailable);
  if (image.complete && image.naturalWidth === 0) showUnavailable();
});


// Show an "OPEN" cursor on prominent links without changing their click behavior.
// This visual effect is desktop-only: touch and keyboard navigation remain normal.
(() => {
  const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!pointerQuery.matches) return;
  const selector = 'a.btn, a.card[href], button.copy-email-btn';
  const indicator = document.createElement('span');
  indicator.className = 'open-hover-cursor';
  indicator.textContent = 'OPEN';
  indicator.setAttribute('aria-hidden', 'true');
  document.body.appendChild(indicator);
  document.body.classList.add('open-hover-enabled');

  let copiedCursorUntil = 0;
  window.markEmailCursorCopied = () => {
    copiedCursorUntil = Date.now() + 1100;
    if (indicator.classList.contains('is-visible')) {
      indicator.textContent = '✓';
      indicator.classList.add('is-copied');
    }
  };
  const hide = () => { indicator.classList.remove('is-visible', 'is-copied'); };

  document.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse') {
      hide();
      return;
    }
    const element = event.target instanceof Element ? event.target.closest(selector) : null;
    if (!element) {
      hide();
      return;
    }
    const isCopyTarget = element.matches('button.copy-email-btn');
    const showCopied = isCopyTarget && Date.now() < copiedCursorUntil;
    indicator.textContent = showCopied ? '✓' : (isCopyTarget ? 'COPY' : 'OPEN');
    indicator.classList.toggle('is-copied', showCopied);
    indicator.style.left = event.clientX + 'px';
    indicator.style.top = event.clientY + 'px';
    indicator.classList.add('is-visible');
  }, { passive: true });

  document.addEventListener('pointerleave', hide);
  document.addEventListener('pointercancel', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, { passive: true });
  pointerQuery.addEventListener?.('change', event => {
    document.body.classList.toggle('open-hover-enabled', event.matches);
    if (!event.matches) hide();
  });
})();


// Copy email to clipboard and display confirmation ONLY if the copy succeeded.
(() => {
  const buttons = document.querySelectorAll('button[data-copy-email]');
  if (!buttons.length) return;

  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  document.body.appendChild(toast);
  let toastTimer;
  let labelTimer;

  function showToast(text, isError = false) {
    window.clearTimeout(toastTimer);
    toast.replaceChildren();
    const icon = document.createElement('span');
    icon.className = 'copy-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = isError ? '!' : '✓';
    const label = document.createElement('span');
    label.textContent = text;
    toast.append(icon, label);
    toast.classList.toggle('is-error', isError);
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2500);
  }

  async function writeClipboard(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (_) {
        // Fall back for browsers that block the modern clipboard API.
      }
    }
    const temp = document.createElement('textarea');
    temp.value = value;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    let succeeded = false;
    try { succeeded = document.execCommand('copy'); }
    finally { temp.remove(); }
    if (!succeeded) throw new Error('Clipboard unavailable');
  }

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const email = button.getAttribute('data-copy-email');
      if (!email) return;
      try {
        await writeClipboard(email);
        showToast('COPIED TO CLIPBOARD — email address ready to paste');
        window.markEmailCursorCopied?.();
        window.clearTimeout(labelTimer);
        const label = button.querySelector('.copy-button-label');
        if (label) {
          label.textContent = 'Copied!';
          button.classList.add('did-copy');
          labelTimer = window.setTimeout(() => {
            label.textContent = 'Copy email';
            button.classList.remove('did-copy');
          }, 1800);
        }
      } catch (_) {
        showToast('Could not copy. Select the email address above.', true);
      }
    });
  });
})();



// Interactive daybreak / nightfall toggle. Saved across all portfolio pages.
(() => {
  const root = document.documentElement;
  const header = document.querySelector('.header-inner');
  if (!header) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.innerHTML = '<svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg><svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 13.4A8.5 8.5 0 0 1 10.6 3.3a8.6 8.6 0 1 0 10.1 10.1Z"/></svg><span class="theme-toggle-label"></span>';
  header.appendChild(button);
  const getMode = () => root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const updateLabel = () => {
    const toLight = getMode() === 'dark';
    button.querySelector('.theme-toggle-label').textContent = toLight ? 'Light' : 'Dark';
    button.setAttribute('aria-label', toLight ? 'Switch to light mode' : 'Switch to dark mode');
    button.title = toLight ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-pressed', String(!toLight));
  };
  const setMode = mode => {
    root.setAttribute('data-theme', mode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'light' ? '#f7f0e6' : '#211719');
    try { localStorage.setItem('dallas-portfolio-theme', mode); } catch (_) {}
    updateLabel();
  };
  updateLabel();

  let animating = false;
  button.addEventListener('click', () => {
    if (animating) return;
    const next = getMode() === 'dark' ? 'light' : 'dark';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsPortal = !!(window.CSS && CSS.supports && CSS.supports('clip-path', 'circle(10px at 10px 10px)'));
    if (reducedMotion || !supportsPortal) { setMode(next); return; }

    animating = true;
    button.classList.add('is-morphing');
    button.setAttribute('aria-busy', 'true');
    const rect = button.getBoundingClientRect();
    const fx = document.createElement('div');
    fx.className = 'theme-morph theme-morph--' + next;
    fx.setAttribute('aria-hidden', 'true');
    fx.style.setProperty('--origin-x', (rect.left + rect.width / 2) + 'px');
    fx.style.setProperty('--origin-y', (rect.top + rect.height / 2) + 'px');

    const veil = document.createElement('div');
    veil.className = 'theme-morph__veil';
    const texture = document.createElement('div');
    texture.className = 'theme-morph__texture';
    fx.append(veil, texture);
    for (let i = 0; i < 2; i += 1) {
      const ring = document.createElement('span');
      ring.className = 'theme-morph__ring theme-morph__ring--' + (i ? 'two' : 'one');
      fx.appendChild(ring);
    }
    for (let i = 0; i < 12; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'theme-morph__spark';
      spark.style.setProperty('--ray', (i * 30) + 'deg');
      spark.style.setProperty('--distance', (100 + (i % 3) * 24) + 'px');
      spark.style.setProperty('--delay', (i % 4) * 35 + 'ms');
      fx.appendChild(spark);
    }
    const orb = document.createElement('span');
    orb.className = 'theme-morph__orb';
    const word = document.createElement('span');
    word.className = 'theme-morph__word';
    word.textContent = next === 'light' ? 'Daybreak' : 'Nightfall';
    fx.append(orb, word);
    document.body.appendChild(fx);

    // The expanding veil covers the old palette before switching to the new one.
    window.setTimeout(() => setMode(next), 525);
    window.setTimeout(() => {
      fx.remove();
      button.classList.remove('is-morphing');
      button.removeAttribute('aria-busy');
      animating = false;
    }, 1060);
  });
})();


// Glitch effect for all content headings without replacing heading typography or links.
(() => {
  // Keep the existing visual layers on the homepage name and apply them
  // to other h1–h4 words, preserving inline emphasis and natural word wrapping.
  document.querySelectorAll('main h1, main h2, main h3, main h4').forEach(heading => {
    heading.classList.add('glitch-heading');

    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim()) continue;
      if (node.parentElement.closest('.name-glitch')) continue;
      textNodes.push(node);
    }

    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else {
          const word = document.createElement('span');
          word.className = 'name-glitch';
          word.setAttribute('data-text', part);
          word.textContent = part;
          fragment.appendChild(word);
        }
      });
      node.replaceWith(fragment);
    });
  });
})();

// Keep present-day portfolio labels in sync with the year in Atlanta.
(() => {
  function updateCurrentYear(date = new Date()) {
    const year = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', year: 'numeric',
    }).format(date);
    document.querySelectorAll('[data-current-year]').forEach(label => {
      if (label.textContent !== year) label.textContent = year;
    });
  }
  updateCurrentYear();
  window.setInterval(updateCurrentYear, 30000);
  window.addEventListener('pageshow', () => updateCurrentYear());
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateCurrentYear();
  });
})();

// Share the free portfolio search guide across all classic pages.
(() => {
  const script = document.createElement('script');
  script.src = '/portfolio-guide.js?v=free-guide-20261014';
  document.body.appendChild(script);
})();
