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
  if (onChangeCb) onChangeCb();
}

export async function initFilters() {
  try {
    [genreCache.movies, genreCache.tv] = await Promise.all([
      fetchGenres('movies'),
      fetchGenres('tv'),
    ]);
  } catch { /* genres not critical */ }
  renderGenreOptions();
  bindEvents();
  bindFilterToggle();
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
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
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
  document.getElementById('search-input').value = '';
  document.getElementById('filter-genre').value = '';
  document.getElementById('filter-year-from').value = '';
  document.getElementById('filter-year-to').value = '';
  const slider = document.getElementById('filter-rating');
  slider.value = 0;
  document.getElementById('rating-display').textContent = 'Any';
  document.getElementById('filter-language').value = '';
  document.getElementById('filter-sort').value = 'popularity.desc';
}

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
  };
  if (map[key]) map[key]();
}
