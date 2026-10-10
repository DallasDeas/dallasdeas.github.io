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
  const selector = 'a.btn, a.card[href]';
  const indicator = document.createElement('span');
  indicator.className = 'open-hover-cursor';
  indicator.textContent = 'OPEN';
  indicator.setAttribute('aria-hidden', 'true');
  document.body.appendChild(indicator);
  document.body.classList.add('open-hover-enabled');

  const hide = () => indicator.classList.remove('is-visible');

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
