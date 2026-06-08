import { initTheme } from './theme.js';
import { fetchPopular, searchContent, discoverContent } from './api.js';
import {
  renderCards, initInfiniteScroll, destroyInfiniteScroll,
  showLoading, hideLoading, showEnd, showEmpty, showError,
  initGoToTop, setTab,
} from './gallery.js';
import { state, initFilters, onFilterChange, renderFilterBar, renderChips } from './filters.js';
import { initModal } from './modal.js';

let isFetching = false;
let totalPages = 1;

function hasActiveFilters() {
  return state.genre || state.yearFrom || state.yearTo ||
         state.minRating || state.language ||
         state.sortBy !== 'popularity.desc';
}

async function fetchPage(append) {
  if (isFetching) return;
  if (append && state.page > totalPages) { showEnd(); destroyInfiniteScroll(); return; }

  isFetching = true;
  showLoading();

  try {
    let data;
    if (state.search) {
      data = await searchContent(state.tab, state.search, state.page);
    } else if (hasActiveFilters()) {
      data = await discoverContent(state.tab, state, state.page);
    } else {
      data = await fetchPopular(state.tab, state.page);
    }

    totalPages = data.total_pages || 1;
    const results = data.results || [];

    if (!append && results.length === 0) { showEmpty(); return; }

    renderCards(results, append);

    if (state.page >= totalPages) {
      showEnd();
      destroyInfiniteScroll();
    } else {
      hideLoading();
    }
  } catch (err) {
    const msg = err.message === 'RATE_LIMIT'
      ? 'Too many requests — please wait a moment and retry.'
      : 'Failed to load content. Please try again.';
    showError(msg, () => fetchPage(append));
  } finally {
    isFetching = false;
  }
}

function loadMore() {
  if (isFetching || state.page >= totalPages) return;
  state.page += 1;
  fetchPage(true);
}

function resetAndLoad() {
  state.page = 1;
  totalPages = 1;
  isFetching = false;
  destroyInfiniteScroll();
  fetchPage(false).then(() => {
    if (totalPages > 1) initInfiniteScroll(loadMore);
  });
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === state.tab) return;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tab = btn.dataset.tab;
      setTab(state.tab);
      renderFilterBar();
      resetAndLoad();
    });
  });
}

async function init() {
  initTheme();
  initModal();
  initGoToTop();
  setupTabs();
  await initFilters();
  onFilterChange(() => {
    renderChips();
    resetAndLoad();
  });
  resetAndLoad();
}

init();
