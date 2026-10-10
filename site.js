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
