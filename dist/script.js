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
  notion: {
    title: 'Notion Workspace',
    kicker: 'MOBILE APP / 05 MAIN SCREENS',
    base: 'https://www.figma.com/proto/bHLmlsCEXNbpAmQUV1JmKK/notion-app',
    params: 'scaling=contain&content-scaling=responsive',
    frames: ['1-8', '1-9', '1-11', '12-16', '1-13']
  },
  usdt: {
    title: 'USDT Wallet',
    kicker: 'MOBILE APP / 03 MAIN SCREENS',
    base: 'https://www.figma.com/proto/8OIrX3gwuX9JMtKacGAjF3/usdt-i',
    params: 'scaling=scale-down&content-scaling=fixed&page-id=2%3A3',
    frames: ['2429-187', '2402-10714', '2731-2092']
  },
  'uax-wallet': {
    title: 'UAX Wallet',
    kicker: 'MOBILE APP / 05 MAIN SCREENS',
    base: 'https://www.figma.com/proto/udOySghygoYuF8Agavp0kg/uax-wallet-flow',
    params: 'scaling=scale-down&content-scaling=fixed',
    frames: ['1-5', '1-6', '3-5', '9-16', '13-24']
  },
  sunstake: {
    title: 'Sunstake Mobile',
    kicker: 'MOBILE APP / 05 MAIN SCREENS',
    base: 'https://www.figma.com/proto/RBzp6BYmCVNll6mMU7uH9c/sunstake',
    params: 'scaling=scale-down&content-scaling=fixed',
    frames: ['8203-4', '8208-71', '8862-132', '8216-160', '9166-146']
  },
  'uax-landing': {
    title: 'UAX Landing',
    kicker: 'RESPONSIVE WEB / MAIN PAGE',
    base: 'https://www.figma.com/proto/FoepdaHWTNuDaKMKX7d41q/UAX-landing',
    params: 'scaling=scale-down-width&content-scaling=fixed',
    frames: ['261-14']
  },
  'uax-workflow': {
    title: 'UAX Workflow',
    kicker: 'RESPONSIVE WEB / 03 MAIN SCREENS',
    base: 'https://www.figma.com/proto/TWw0RygkztfIkSp6Wt85GC/uax-workflow',
    params: 'scaling=scale-down-width&content-scaling=fixed',
    frames: ['4-25', '12-133', '35-237']
  }
};

const galleryModal = document.querySelector('#gallery-modal');
const galleryFrame = document.querySelector('#gallery-frame');
const galleryTitle = document.querySelector('#gallery-title');
const galleryKicker = document.querySelector('#gallery-kicker');
const galleryCount = document.querySelector('#gallery-count');
const galleryDots = document.querySelector('#gallery-dots');
const galleryPrev = document.querySelector('#gallery-prev');
const galleryNext = document.querySelector('#gallery-next');
let activeGallery = null;
let activeGalleryIndex = 0;

function galleryUrl(project, frame) {
  const prototype = `${project.base}?node-id=${frame}&${project.params}`;
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototype)}`;
}

function renderGalleryFrame() {
  if (!activeGallery) return;
  const frame = activeGallery.frames[activeGalleryIndex];
  galleryFrame.src = galleryUrl(activeGallery, frame);
  galleryTitle.textContent = activeGallery.title;
  galleryKicker.textContent = activeGallery.kicker;
  galleryCount.textContent = `${String(activeGalleryIndex + 1).padStart(2, '0')} / ${String(activeGallery.frames.length).padStart(2, '0')}`;
  galleryDots.innerHTML = activeGallery.frames.map((_, index) => `<button class="gallery-dot${index === activeGalleryIndex ? ' is-active' : ''}" type="button" aria-label="Show mockup ${index + 1}" data-gallery-index="${index}"></button>`).join('');
  galleryDots.querySelectorAll('[data-gallery-index]').forEach((dot) => dot.addEventListener('click', () => {
    activeGalleryIndex = Number(dot.dataset.galleryIndex);
    renderGalleryFrame();
  }));
}

function openGallery(name) {
  activeGallery = galleryProjects[name];
  if (!activeGallery) return;
  activeGalleryIndex = 0;
  renderGalleryFrame();
  galleryModal.classList.add('is-open');
  galleryModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeGallery() {
  galleryModal.classList.remove('is-open');
  galleryModal.setAttribute('aria-hidden', 'true');
  galleryFrame.src = 'about:blank';
  document.body.style.overflow = '';
  activeGallery = null;
}

document.querySelectorAll('[data-gallery]').forEach((card) => {
  card.addEventListener('click', () => openGallery(card.dataset.gallery));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGallery(card.dataset.gallery);
    }
  });
});
document.querySelectorAll('[data-gallery-close]').forEach((element) => element.addEventListener('click', closeGallery));
galleryPrev.addEventListener('click', () => {
  if (!activeGallery) return;
  activeGalleryIndex = (activeGalleryIndex - 1 + activeGallery.frames.length) % activeGallery.frames.length;
  renderGalleryFrame();
});
galleryNext.addEventListener('click', () => {
  if (!activeGallery) return;
  activeGalleryIndex = (activeGalleryIndex + 1) % activeGallery.frames.length;
  renderGalleryFrame();
});
document.addEventListener('keydown', (event) => {
  if (!activeGallery) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') galleryPrev.click();
  if (event.key === 'ArrowRight') galleryNext.click();
});
