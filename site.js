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
