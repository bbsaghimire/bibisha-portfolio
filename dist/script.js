const menuToggle = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const menuLinks = document.querySelectorAll('[data-menu-link]');
const progress = document.querySelector('.scroll-progress span');
const cursor = document.querySelector('.cursor');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuPanel.classList.toggle('is-open', open);
  menuPanel.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
}

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

if (cursor && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }, { passive: true });
  document.querySelectorAll('a, button, summary').forEach((target) => {
    target.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2.5)'; });
    target.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; });
  });
}

document.querySelectorAll('.project-visual').forEach((visual) => {
  if (window.matchMedia('(pointer:fine)').matches) {
    visual.addEventListener('pointermove', (event) => {
      const rect = visual.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 4;
      const rotateX = ((event.clientY - rect.top) / rect.height - .5) * -4;
      visual.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    visual.addEventListener('pointerleave', () => { visual.style.transform = ''; });
  }
});

const galleryProjects = {
  notion: { base: 'https://www.figma.com/proto/bHLmlsCEXNbpAmQUV1JmKK/notion-app', params: 'scaling=contain&content-scaling=responsive', frames: ['1-8', '1-9', '1-11', '12-16', '1-13'] },
  usdt: { base: 'https://www.figma.com/proto/8OIrX3gwuX9JMtKacGAjF3/usdt-i', params: 'scaling=scale-down&content-scaling=fixed&page-id=2%3A3', frames: ['2429-187', '2402-10714', '2731-2092'] },
  'uax-wallet': { base: 'https://www.figma.com/proto/udOySghygoYuF8Agavp0kg/uax-wallet-flow', params: 'scaling=scale-down&content-scaling=fixed', frames: ['1-5', '1-6', '3-5', '9-16', '13-24'] },
  sunstake: { base: 'https://www.figma.com/proto/RBzp6BYmCVNll6mMU7uH9c/sunstake', params: 'scaling=scale-down&content-scaling=fixed', frames: ['8203-4', '8208-71', '8862-132', '8216-160', '9166-146'] },
  'uax-landing': { base: 'https://www.figma.com/proto/FoepdaHWTNuDaKMKX7d41q/UAX-landing', params: 'scaling=scale-down-width&content-scaling=fixed', frames: ['261-14'] },
  'uax-workflow': { base: 'https://www.figma.com/proto/TWw0RygkztfIkSp6Wt85GC/uax-workflow', params: 'scaling=scale-down-width&content-scaling=fixed', frames: ['4-25', '12-133', '35-237'] }
};

function galleryUrl(project, frame) {
  const prototype = `${project.base}?node-id=${frame}&${project.params}`;
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototype)}`;
}

function loadProjectFrame(iframe) {
  if (!iframe || iframe.dataset.loaded === 'true') return;
  const deferredSource = iframe.dataset.lazySrc;
  if (!deferredSource) {
    iframe.dataset.loaded = 'true';
    return;
  }
  iframe.src = deferredSource;
  iframe.dataset.loaded = 'true';
}

function showProjectFrame(visual, project, index) {
  const iframe = visual.querySelector('iframe');
  const buttons = visual.querySelectorAll('.mockup-dot');
  if (!iframe || !project.frames[index]) return;
  const nextSource = galleryUrl(project, project.frames[index]);
  visual.classList.add('is-loading');
  iframe.dataset.loaded = 'true';
  iframe.onload = () => visual.classList.remove('is-loading');
  iframe.src = nextSource;
  buttons.forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === index));
}

document.querySelectorAll('[data-gallery] .project-visual').forEach((visual) => {
  const project = galleryProjects[visual.closest('[data-gallery]')?.dataset.gallery];
  const controls = visual.querySelector('.mockup-controls');
  if (!project || !controls) return;
  controls.innerHTML = project.frames.map((_, index) => `<button class="mockup-dot${index === 0 ? ' is-active' : ''}" type="button" aria-label="Show project screen ${index + 1}"></button>`).join('');
  controls.querySelectorAll('.mockup-dot').forEach((button, index) => button.addEventListener('click', () => showProjectFrame(visual, project, index)));
  const iframe = visual.querySelector('iframe');
  iframe?.addEventListener('load', () => visual.classList.remove('is-loading'));
});

const frameObserver = new IntersectionObserver((entries, observerInstance) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    loadProjectFrame(entry.target.querySelector('iframe'));
    observerInstance.unobserve(entry.target);
  });
}, { rootMargin: '900px 0px' });
document.querySelectorAll('[data-gallery] .project-visual').forEach((visual) => frameObserver.observe(visual));
