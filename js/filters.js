import { fetchGenres } from './api.js';

export const state = {
  tab: 'movies',
  search: '',
  genre: null,
  yearFrom: null,
  yearTo: null,
  minRating: null,
  language: null,
  sortBy: 'popularity.desc',
  page: 1,
};

const genreCache = { movies: [], tv: [] };
let onChangeCb = null;
let searchTimer = null;

export function onFilterChange(cb) { onChangeCb = cb; }

function notify() {
  state.page = 1;
  renderChips();
  pushHash();
  if (onChangeCb) onChangeCb();
}

export async function initFilters() {
  loadFromHash();
  try {
    [genreCache.movies, genreCache.tv] = await Promise.all([
      fetchGenres('movies'),
      fetchGenres('tv'),
    ]);
  } catch { /* genres not critical */ }
  renderGenreOptions();
  syncAllInputsFromState();
  bindEvents();
  bindFilterToggle();
  window.addEventListener('hashchange', () => {
    loadFromHash();
    renderGenreOptions();
    syncAllInputsFromState();
    renderChips();
    if (onChangeCb) onChangeCb();
  });
}

function bindFilterToggle() {
  const btn = document.getElementById('filter-toggle');
  const panel = document.getElementById('filter-advanced');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

export function renderFilterBar() {
  renderGenreOptions();
  renderChips();
}

function renderGenreOptions() {
  const sel = document.getElementById('filter-genre');
  const genres = state.tab === 'movies' ? genreCache.movies : genreCache.tv;
  sel.innerHTML = '<option value="">All Genres</option>';
  for (const g of genres) {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    if (state.genre == g.id) opt.selected = true;
    sel.appendChild(opt);
  }
}

function bindEvents() {
  const searchInput = document.getElementById('search-input');
  const searchDot = document.getElementById('search-dot');

  searchInput.addEventListener('input', e => {
    if (searchDot) searchDot.classList.add('active');
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (searchDot) searchDot.classList.remove('active');
      state.search = e.target.value.trim();
      notify();
    }, 400);
  });

  document.getElementById('filter-genre').addEventListener('change', e => {
    state.genre = e.target.value ? Number(e.target.value) : null;
    notify();
  });

  document.getElementById('filter-year-from').addEventListener('change', e => {
    state.yearFrom = e.target.value ? Number(e.target.value) : null;
    notify();
  });

  document.getElementById('filter-year-to').addEventListener('change', e => {
    state.yearTo = e.target.value ? Number(e.target.value) : null;
    notify();
  });

  const slider = document.getElementById('filter-rating');
  const ratingDisplay = document.getElementById('rating-display');
  slider.addEventListener('input', e => {
    const v = Number(e.target.value);
    ratingDisplay.textContent = v === 0 ? 'Any' : v.toFixed(1) + '+';
    state.minRating = v === 0 ? null : v;
  });
  slider.addEventListener('change', () => notify());

  document.getElementById('filter-language').addEventListener('change', e => {
    state.language = e.target.value || null;
    notify();
  });

  document.getElementById('filter-sort').addEventListener('change', e => {
    state.sortBy = e.target.value;
    notify();
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    clearFilters();
    notify();
  });
}

function clearFilters() {
  state.search = '';
  state.genre = null;
  state.yearFrom = null;
  state.yearTo = null;
  state.minRating = null;
  state.language = null;
  state.sortBy = 'popularity.desc';
  syncAllInputsFromState();
}

// ─── URL hash share link ───

export function pushHash() {
  const p = {};
  if (state.tab !== 'movies')             p.tab = state.tab;
  if (state.search)                        p.q = state.search;
  if (state.genre)                         p.genre = state.genre;
  if (state.yearFrom)                      p.yf = state.yearFrom;
  if (state.yearTo)                        p.yt = state.yearTo;
  if (state.minRating)                     p.rating = state.minRating;
  if (state.language)                      p.lang = state.language;
  if (state.sortBy !== 'popularity.desc')  p.sort = state.sortBy;

  const hash = Object.keys(p).length
    ? '#' + new URLSearchParams(p).toString()
    : '#';
  history.replaceState(null, '', hash);
}

function loadFromHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return;
  const p = Object.fromEntries(new URLSearchParams(raw));
  if (p.tab)    state.tab    = p.tab;
  if (p.q)      state.search = p.q;
  if (p.genre)  state.genre  = Number(p.genre);
  if (p.yf)     state.yearFrom  = Number(p.yf);
  if (p.yt)     state.yearTo    = Number(p.yt);
  if (p.rating) state.minRating = Number(p.rating);
  if (p.lang)   state.language  = p.lang;
  if (p.sort)   state.sortBy    = p.sort;
}

// ─── Tab persistence ───

const TAB_KEY = 'ds-tab';

export function saveTab(tab) {
  localStorage.setItem(TAB_KEY, tab);
}

export function loadSavedTab() {
  return localStorage.getItem(TAB_KEY) || 'movies';
}

// ─── Chips ───

const LANG_LABELS = {
  en: 'English', fr: 'French', es: 'Spanish', de: 'German',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', it: 'Italian',
  pt: 'Portuguese', hi: 'Hindi', ar: 'Arabic',
};

const SORT_LABELS = {
  'popularity.desc': 'Popularity ↓', 'popularity.asc': 'Popularity ↑',
  'vote_average.desc': 'Rating ↓', 'vote_average.asc': 'Rating ↑',
  'release_date.desc': 'Release ↓', 'release_date.asc': 'Release ↑',
  'original_title.asc': 'Title A–Z', 'original_title.desc': 'Title Z–A',
};

export function renderChips() {
  const chips = [];
  const genres = state.tab === 'movies' ? genreCache.movies : genreCache.tv;

  if (state.genre) {
    const g = genres.find(g => g.id == state.genre);
    if (g) chips.push({ label: `Genre: ${g.name}`, key: 'genre', reset: null });
  }
  if (state.yearFrom) chips.push({ label: `From: ${state.yearFrom}`, key: 'yearFrom', reset: null });
  if (state.yearTo)   chips.push({ label: `To: ${state.yearTo}`, key: 'yearTo', reset: null });
  if (state.minRating) chips.push({ label: `Rating: ${state.minRating}+`, key: 'minRating', reset: null });
  if (state.language) chips.push({ label: LANG_LABELS[state.language] || state.language, key: 'language', reset: null });
  if (state.sortBy !== 'popularity.desc') {
    chips.push({ label: SORT_LABELS[state.sortBy] || state.sortBy, key: 'sortBy', reset: 'popularity.desc' });
  }

  const container = document.getElementById('filter-chips');
  container.innerHTML = '';
  for (const chip of chips) {
    const span = document.createElement('span');
    span.className = 'chip';
    const labelNode = document.createTextNode(chip.label + ' ');
    span.appendChild(labelNode);
    const btn = document.createElement('button');
    btn.className = 'chip-remove';
    btn.textContent = '×';
    btn.setAttribute('aria-label', `Remove ${chip.label}`);
    btn.addEventListener('click', () => {
      state[chip.key] = chip.reset !== null ? chip.reset : null;
      syncInputFromState(chip.key);
      notify();
    });
    span.appendChild(btn);
    container.appendChild(span);
  }

  // Share link chip when any filter active
  if (chips.length) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'chip share-chip';
    shareBtn.textContent = '⇪ Copy link';
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(location.href).then(() => {
        shareBtn.textContent = '✓ Copied';
        setTimeout(() => { shareBtn.textContent = '⇪ Copy link'; }, 1800);
      });
    });
    container.appendChild(shareBtn);
  }

  document.getElementById('clear-filters').style.display =
    chips.length ? 'inline-block' : 'none';

  const countEl = document.getElementById('filter-count');
  if (countEl) {
    const activeCount = chips.filter(c => c.key !== 'sortBy').length;
    countEl.textContent = activeCount;
    countEl.style.display = activeCount ? 'inline' : 'none';
  }
}

function syncInputFromState(key) {
  const map = {
    genre:     () => { document.getElementById('filter-genre').value = state.genre || ''; },
    yearFrom:  () => { document.getElementById('filter-year-from').value = state.yearFrom || ''; },
    yearTo:    () => { document.getElementById('filter-year-to').value = state.yearTo || ''; },
    minRating: () => {
      document.getElementById('filter-rating').value = state.minRating || 0;
      document.getElementById('rating-display').textContent = state.minRating ? state.minRating + '+' : 'Any';
    },
    language:  () => { document.getElementById('filter-language').value = state.language || ''; },
    sortBy:    () => { document.getElementById('filter-sort').value = state.sortBy; },
    search:    () => { document.getElementById('search-input').value = state.search || ''; },
  };
  if (map[key]) map[key]();
}

function syncAllInputsFromState() {
  ['genre', 'yearFrom', 'yearTo', 'minRating', 'language', 'sortBy', 'search'].forEach(syncInputFromState);
}
