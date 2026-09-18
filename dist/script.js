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

const workFilters = document.querySelectorAll('.work-filter');
const workCards = document.querySelectorAll('.project-card[data-kind]');
workFilters.forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    const filter = filterButton.dataset.filter;
    workFilters.forEach((button) => {
      const active = button === filterButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    workCards.forEach((card) => {
      const shouldHide = filter !== 'all' && card.dataset.kind !== filter;
      card.hidden = shouldHide;
      card.classList.toggle('is-filtered', shouldHide);
    });
  });
});

const galleryModal = document.querySelector('#gallery-modal');
const galleryImage = document.querySelector('#gallery-image');
const galleryIframe = document.querySelector('#gallery-iframe');
const galleryTitle = document.querySelector('#gallery-title');
const galleryKicker = document.querySelector('#gallery-kicker');
const galleryCount = document.querySelector('#gallery-count');
const galleryCaption = document.querySelector('#gallery-caption');
const galleryDots = document.querySelector('#gallery-dots');
const galleryFrame = document.querySelector('.gallery-frame');
const galleryState = { items: [], index: 0, title: '' };

function galleryItems(card) {
  const images = [...card.querySelectorAll('.asset-screen img, .document-collage img')].map((image) => ({
    type: 'image',
    src: image.currentSrc || image.src,
    alt: image.alt
  }));
  const iframe = card.querySelector('iframe');
  if (iframe) images.push({ type: 'iframe', src: iframe.dataset.src || iframe.src, alt: iframe.title || 'Project design preview' });
  return images;
}

function renderGallery() {
  const item = galleryState.items[galleryState.index];
  if (!item) return;
  galleryImage.hidden = item.type !== 'image';
  galleryIframe.hidden = item.type !== 'iframe';
  if (item.type === 'image') {
    // Keep the source aspect ratio so tall app screens remain fully visible.
    galleryImage.style.width = 'auto';
    galleryImage.style.height = 'auto';
    galleryImage.style.maxWidth = '100%';
    galleryImage.style.maxHeight = '100%';
    galleryImage.style.objectFit = 'contain';
    galleryImage.style.objectPosition = 'center';
    galleryImage.onload = () => {
      galleryFrame.classList.toggle('is-portrait', galleryImage.naturalHeight > galleryImage.naturalWidth);
      galleryFrame.classList.toggle('is-landscape', galleryImage.naturalWidth >= galleryImage.naturalHeight);
    };
    galleryImage.alt = item.alt;
    galleryIframe.removeAttribute('src');
    galleryImage.src = item.src;
    if (galleryImage.complete) galleryImage.onload();
  } else {
    galleryIframe.src = item.src;
    galleryImage.removeAttribute('src');
    galleryFrame.classList.remove('is-portrait', 'is-landscape');
  }
  galleryCount.textContent = `${String(galleryState.index + 1).padStart(2, '0')} / ${String(galleryState.items.length).padStart(2, '0')}`;
  galleryCaption.textContent = item.alt;
  galleryDots.innerHTML = galleryState.items.map((_, index) => `<button class="gallery-dot${index === galleryState.index ? ' is-active' : ''}" type="button" data-gallery-index="${index}" aria-label="View screen ${index + 1}"></button>`).join('');
}

function openGallery(card) {
  galleryState.items = galleryItems(card);
  galleryState.index = 0;
  galleryState.title = card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim() || 'Project design';
  galleryTitle.textContent = galleryState.title;
  galleryKicker.textContent = card.querySelector('.project-meta span')?.textContent || 'SELECTED SCREENS';
  renderGallery();
  galleryModal.classList.add('is-open');
  galleryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('gallery-open');
}

function closeGallery() {
  galleryModal.classList.remove('is-open');
  galleryModal.setAttribute('aria-hidden', 'true');
  galleryIframe.removeAttribute('src');
  document.body.classList.remove('gallery-open');
}

document.querySelectorAll('.project-card[data-gallery] .view-design').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    openGallery(trigger.closest('.project-card'));
  });
});

galleryModal?.querySelectorAll('.gallery-close, .gallery-backdrop').forEach((trigger) => trigger.addEventListener('click', closeGallery));
galleryModal?.querySelector('[data-gallery-prev]')?.addEventListener('click', () => {
  galleryState.index = (galleryState.index - 1 + galleryState.items.length) % galleryState.items.length;
  renderGallery();
});
galleryModal?.querySelector('[data-gallery-next]')?.addEventListener('click', () => {
  galleryState.index = (galleryState.index + 1) % galleryState.items.length;
  renderGallery();
});
galleryDots?.addEventListener('click', (event) => {
  const dot = event.target.closest('[data-gallery-index]');
  if (dot) { galleryState.index = Number(dot.dataset.galleryIndex); renderGallery(); }
});
document.addEventListener('keydown', (event) => {
  if (!galleryModal?.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') galleryModal.querySelector('[data-gallery-prev]')?.click();
  if (event.key === 'ArrowRight') galleryModal.querySelector('[data-gallery-next]')?.click();
});
