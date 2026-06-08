import { IMG_BASE } from './api.js';
import { openModal } from './modal.js';

let currentTab = 'movies';
let scrollObserver = null;

export function setTab(tab) { currentTab = tab; }

export function renderCards(items, append = false) {
  const grid = document.getElementById('grid');
  if (!append) grid.innerHTML = '';
  for (const item of items) grid.appendChild(createCard(item));
}

function createCard(item) {
  const isMovie = currentTab === 'movies';
  const title = isMovie ? (item.title || '') : (item.name || '');
  const dateField = isMovie ? item.release_date : item.first_air_date;
  const year = dateField ? dateField.slice(0, 4) : '';
  const score = item.vote_average || 0;
  const rating = score > 0 ? score.toFixed(1) : 'N/A';
  const ratingClass = score >= 7 ? 'rating-green' : score >= 5 ? 'rating-yellow' : 'rating-red';

  const card = document.createElement('div');
  card.className = 'card';

  if (item.poster_path) {
    const img = document.createElement('img');
    img.src = `${IMG_BASE}${item.poster_path}`;
    img.alt = title;
    img.loading = 'lazy';
    img.onerror = () => img.replaceWith(buildPlaceholder(title));
    card.appendChild(img);
  } else {
    card.appendChild(buildPlaceholder(title));
  }

  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';
  overlay.innerHTML = `
    <span class="card-title">${esc(title)}</span>
    <div class="card-meta">
      <span class="card-year">${esc(year)}</span>
      <span class="card-rating ${ratingClass}">${esc(rating)}</span>
    </div>
  `;
  card.appendChild(overlay);

  card.addEventListener('click', () => {
    if (isMovie) {
      window.open(`https://vidvault.ru/movie/${item.id}`, '_blank', 'noopener');
    } else {
      openModal(item);
    }
  });

  return card;
}

function buildPlaceholder(title) {
  const initials = title.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => (w[0] || '').toUpperCase())
    .join('');
  const hue = [...title].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const div = document.createElement('div');
  div.className = 'card-placeholder';
  div.style.setProperty('--hue', hue);
  div.setAttribute('data-initials', initials || '?');
  return div;
}

export function showLoading() {
  document.getElementById('sentinel').innerHTML = '<div class="spinner"></div>';
}
export function hideLoading() {
  document.getElementById('sentinel').innerHTML = '';
}
export function showEnd() {
  document.getElementById('sentinel').innerHTML = '<p class="end-message">— end —</p>';
}
export function showEmpty() {
  document.getElementById('grid').innerHTML =
    '<div class="empty-state"><p>No results found. Try adjusting your filters.</p></div>';
  document.getElementById('sentinel').innerHTML = '';
}
export function showError(message, onRetry) {
  document.getElementById('grid').innerHTML = `
    <div class="error-state">
      <p>${esc(message)}</p>
      <button id="retry-btn">Retry</button>
    </div>
  `;
  document.getElementById('sentinel').innerHTML = '';
  document.getElementById('retry-btn').addEventListener('click', onRetry);
}

export function initInfiniteScroll(onLoadMore) {
  destroyInfiniteScroll();
  const sentinel = document.getElementById('sentinel');
  scrollObserver = new IntersectionObserver(
    entries => { if (entries[0].isIntersecting) onLoadMore(); },
    { rootMargin: '300px' }
  );
  scrollObserver.observe(sentinel);
}
export function destroyInfiniteScroll() {
  if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }
}

export function initGoToTop() {
  const btn = document.getElementById('go-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
