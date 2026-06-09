import { IMG_BASE, TODAY, fetchShowDetail } from './api.js';
import { getGenreMap } from './filters.js';
import { openModal } from './modal.js';
import { showMovieContextMenu } from './contextMenu.js';

const IMG_BASE_HQ = 'https://image.tmdb.org/t/p/w780';
const SKELETON_COUNT = 20;
const ABOVE_FOLD = 8;
const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

let currentTab = 'movies';
let scrollObserver = null;
let scrollObserverPending = false;
let cardCounter = 0;

export function setTab(tab) { currentTab = tab; }

export function renderSkeletons() {
  cardCounter = 0;
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.opacity = '1';
  for (let i = 0; i < SKELETON_COUNT; i++) {
    const card = document.createElement('div');
    card.className = 'card skeleton-card';
    const wrap = document.createElement('div');
    wrap.className = 'card-img-wrap loading';
    card.appendChild(wrap);
    grid.appendChild(card);
  }
}

export function fadeGridOut() {
  return new Promise(resolve => {
    const grid = document.getElementById('grid');
    grid.style.transition = 'opacity 0.15s';
    grid.style.opacity = '0';
    setTimeout(resolve, 150);
  });
}

export function renderCards(items, append = false) {
  const grid = document.getElementById('grid');
  if (!append) {
    grid.innerHTML = '';
    cardCounter = 0;
    // Fade in after content replace
    grid.style.opacity = '0';
    requestAnimationFrame(() => {
      grid.style.transition = 'opacity 0.2s';
      grid.style.opacity = '1';
    });
  }
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
  const aboveFold = cardCounter < ABOVE_FOLD;
  const isNew = dateField && dateField >= ONE_WEEK_AGO && dateField <= TODAY;
  cardCounter++;

  // Genre pills (max 2)
  const genreMap = getGenreMap(currentTab);
  const genreIds = (item.genre_ids || []).slice(0, 2);
  const genreNames = genreIds.map(id => genreMap[id]).filter(Boolean);

  const card = document.createElement('div');
  card.className = 'card';

  if (item.poster_path) {
    const wrap = document.createElement('div');
    wrap.className = 'card-img-wrap loading';
    const img = document.createElement('img');
    img.src = `${IMG_BASE}${item.poster_path}`;
    img.alt = title;
    if (aboveFold) {
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.loading = 'lazy';
    }
    img.onload = () => wrap.classList.remove('loading');
    img.onerror = () => wrap.replaceWith(buildPlaceholder(title));

    card.addEventListener('mouseenter', () => {
      if (!img.dataset.hq) {
        img.dataset.hq = '1';
        img.src = `${IMG_BASE_HQ}${item.poster_path}`;
      }
      if (!isMovie) fetchShowDetail(item.id).catch(() => {});
    });

    wrap.appendChild(img);
    card.appendChild(wrap);
  } else {
    card.appendChild(buildPlaceholder(title));
  }

  if (isNew) {
    const newBadge = document.createElement('span');
    newBadge.className = 'card-new-badge';
    newBadge.textContent = 'NEW';
    card.appendChild(newBadge);
  }

  const badge = document.createElement('span');
  badge.className = `card-badge ${ratingClass}`;
  badge.textContent = rating;
  card.appendChild(badge);

  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';

  const genrePillsHtml = genreNames.map(name => `<span class="card-genre-pill">${esc(name)}</span>`).join('');

  overlay.innerHTML = `
    <span class="card-title">${esc(title)}</span>
    <div class="card-meta">
      <span class="card-year">${esc(year)}</span>
    </div>
    ${genreNames.length ? `<div class="card-genres">${genrePillsHtml}</div>` : ''}
  `;
  card.appendChild(overlay);

  // Genre pill clicks set genre filter via custom event
  overlay.querySelectorAll('.card-genre-pill').forEach((pill, i) => {
    pill.addEventListener('click', e => {
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent('genre-filter', { detail: { id: genreIds[i] } }));
    });
  });

  card.addEventListener('click', () => {
    if (isMovie) {
      document.dispatchEvent(new CustomEvent('movie-open', { detail: { item } }));
    } else {
      openModal(item);
    }
  });

  if (isMovie) {
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      showMovieContextMenu(e.clientX, e.clientY, item.id);
    });
  }

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
export function showEmpty(query = '') {
  const googleUrl = query
    ? `https://www.google.com/search?q=${encodeURIComponent(query + ' download')}`
    : '';
  const fallback = googleUrl
    ? `<a class="empty-google-link" href="${googleUrl}" target="_blank" rel="noopener">Search "${esc(query)}" on Google →</a>`
    : '';
  document.getElementById('grid').innerHTML = `
    <div class="empty-state">
      <p>No results found. Try adjusting your filters.</p>
      ${fallback}
    </div>`;
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
    entries => {
      if (!entries[0].isIntersecting) return;
      if (scrollObserverPending) return;
      scrollObserverPending = true;
      onLoadMore();
      setTimeout(() => { scrollObserverPending = false; }, 300);
    },
    { rootMargin: '300px' }
  );
  scrollObserver.observe(sentinel);
}
export function destroyInfiniteScroll() {
  if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }
  scrollObserverPending = false;
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
