import { initTheme } from './theme.js';
import { fetchPopular, searchContent, discoverContent } from './api.js';
import {
  renderCards, renderSkeletons, initInfiniteScroll, destroyInfiniteScroll,
  showLoading, hideLoading, showEnd, showEmpty, showError,
  initGoToTop, setTab,
} from './gallery.js';
import { state, initFilters, onFilterChange, renderFilterBar, renderChips, saveTab, loadSavedTab, pushHash } from './filters.js';
import { initModal } from './modal.js';

let isFetching = false;
let totalPages = 1;
let prefetchTimer = null;
const tabScrollY = { movies: 0, tv: 0 };
let pendingScrollRestore = 0;

function hasActiveFilters() {
  return state.genre || state.yearFrom || state.yearTo ||
         state.minRating || state.language ||
         state.sortBy !== 'popularity.desc';
}

function updateMeta() {
  const tabLabel = state.tab === 'movies' ? 'Movies' : 'TV Shows';
  let title = `Dark System — ${tabLabel} | Download Links`;
  let desc = `Browse ${tabLabel.toLowerCase()} and find download links on Dark System.`;

  if (state.search) {
    title = `"${state.search}" — Dark System`;
    desc = `Search results for "${state.search}" — find movies and TV shows to download on Dark System.`;
  }

  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', desc);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', desc);
}

function buildFetchCall(tab, page) {
  if (state.search)        return searchContent(tab, state.search, page);
  if (hasActiveFilters())  return discoverContent(tab, state, page);
  return fetchPopular(tab, page);
}

function schedulePrefetch() {
  clearTimeout(prefetchTimer);
  if (state.page >= totalPages) return;
  const snapTab  = state.tab;
  const snapPage = state.page + 1;
  prefetchTimer = setTimeout(async () => {
    if (snapTab !== state.tab || snapPage > totalPages) return;
    try { await buildFetchCall(snapTab, snapPage); } catch { /* non-critical */ }
  }, 2000);
}

async function fetchPage(append) {
  if (isFetching) return;
  if (append && state.page > totalPages) { showEnd(); destroyInfiniteScroll(); return; }

  isFetching = true;
  showLoading();
  updateMeta();

  try {
    const data = await buildFetchCall(state.tab, state.page);
    totalPages = data.total_pages || 1;
    const results = data.results || [];

    if (!append && results.length === 0) { showEmpty(state.search); return; }

    renderCards(results, append);

    // Restore per-tab scroll position after first page render
    if (!append && pendingScrollRestore > 0) {
      const y = pendingScrollRestore;
      pendingScrollRestore = 0;
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
    }

    if (state.page >= totalPages) {
      showEnd();
      destroyInfiniteScroll();
    } else {
      hideLoading();
      schedulePrefetch();
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

function resetAndLoad(restoreScroll = false) {
  clearTimeout(prefetchTimer);
  state.page = 1;
  totalPages = 1;
  isFetching = false;
  pendingScrollRestore = restoreScroll ? (tabScrollY[state.tab] || 0) : 0;
  destroyInfiniteScroll();
  renderSkeletons();
  fetchPage(false).then(() => {
    if (totalPages > 1) initInfiniteScroll(loadMore);
  });
}

function syncTabUI(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  setTab(tab);
  const input = document.getElementById('search-input');
  if (input) input.placeholder = tab === 'movies'
    ? 'Search a movie to download...'
    : 'Search a TV show to download...';
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === state.tab) return;
      tabScrollY[state.tab] = window.scrollY;
      state.tab = btn.dataset.tab;
      saveTab(state.tab);
      syncTabUI(state.tab);
      renderFilterBar();
      resetAndLoad(true);
      pushHash();
    });
  });
}

// ─── Keyboard shortcuts ───
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    const modal = document.getElementById('modal');
    const modalOpen = modal?.classList.contains('open');

    // '/' focuses search (only when not already in an input and modal is closed)
    if (e.key === '/' && !inInput && !modalOpen) {
      e.preventDefault();
      const input = document.getElementById('search-input');
      input?.focus();
      input?.select();
    }

    // Escape clears + blurs search when search is focused
    if (e.key === 'Escape' && document.activeElement?.id === 'search-input') {
      const input = document.activeElement;
      if (input.value) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        input.blur();
      }
    }
  });
}

async function init() {
  initTheme();
  initModal();
  initGoToTop();
  initKeyboardShortcuts();
  setupTabs();

  const hashTab = new URLSearchParams(location.hash.replace(/^#/, '')).get('tab');
  const tab = hashTab || loadSavedTab();
  state.tab = tab;
  syncTabUI(tab);

  await initFilters();
  onFilterChange(() => {
    renderChips();
    resetAndLoad();
  });
  resetAndLoad();
}

init();
