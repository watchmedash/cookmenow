import { fetchShowDetail, fetchSeasonDetail, fetchSimilarShows, IMG_BASE, TODAY } from './api.js';
import { IMG_SMALL } from './recents.js';
import { TV_MIRRORS } from './mirrors.js';

const IMG_PROFILE = 'https://image.tmdb.org/t/p/w185';

let currentShowId = null;
let savedScrollY = 0;
let allEpisodes = [];
let currentEpisodeIndex = -1;
let currentSeasonNumber = null;
let allSeasons = [];

export async function openModal(show) {
  currentShowId = show.id;
  savedScrollY = window.scrollY;
  const modal = document.getElementById('modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  try { sessionStorage.setItem('ds-modal', JSON.stringify({ type: 'tv', id: show.id })); } catch {}
  renderBase(show);

  try {
    const detail = await fetchShowDetail(show.id);
    renderSeasons(detail, show.id);
    renderEnhanced(detail);
    fetchSimilarShows(show.id).then(data => renderSimilar(data.results || [])).catch(() => {});
  } catch {
    document.getElementById('modal-seasons').innerHTML =
      '<p class="modal-error">Failed to load seasons.</p>';
  }
}

function renderBase(show) {
  const title = show.name || '';
  const year = (show.first_air_date || '').slice(0, 4);
  const score = show.vote_average || 0;
  const ratingClass = score >= 7 ? 'rating-green' : score >= 5 ? 'rating-yellow' : 'rating-red';

  const poster = document.getElementById('modal-poster');
  if (show.poster_path) {
    poster.src = `${IMG_BASE}${show.poster_path}`;
    poster.loading = 'eager';
    poster.decoding = 'async';
    poster.style.display = '';
  } else {
    poster.style.display = 'none';
  }
  poster.alt = title;

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-year').textContent = year;
  const ratingEl = document.getElementById('modal-rating');
  ratingEl.textContent = score > 0 ? score.toFixed(1) : 'N/A';
  ratingEl.className = `modal-rating ${ratingClass}`;
  document.getElementById('modal-overview').textContent = show.overview || 'No overview available.';
  document.getElementById('modal-seasons').innerHTML = '<div class="spinner"></div>';
  document.getElementById('modal-episodes').innerHTML = '';
  document.getElementById('modal-similar').innerHTML = '';
  document.getElementById('tv-modal-extra').innerHTML = '';
}

function renderEnhanced(detail) {
  const extraEl = document.getElementById('tv-modal-extra');

  // Status + runtime row
  const metaParts = [];
  if (detail.status) metaParts.push(detail.status);
  const runtime = detail.episode_run_time?.[0];
  if (runtime) metaParts.push(`${runtime} min/ep`);
  if (metaParts.length) {
    const statusEl = document.createElement('div');
    statusEl.className = 'tv-modal-status';
    statusEl.textContent = metaParts.join(' · ');
    extraEl.appendChild(statusEl);
  }

  // Genres
  const genres = detail.genres || [];
  if (genres.length) {
    const genreRow = document.createElement('div');
    genreRow.className = 'tv-modal-genres';
    for (const g of genres.slice(0, 4)) {
      const tag = document.createElement('span');
      tag.className = 'movie-genre-tag';
      tag.textContent = g.name;
      genreRow.appendChild(tag);
    }
    extraEl.appendChild(genreRow);
  }

  // Cast
  const cast = (detail.credits?.cast || []).slice(0, 6);
  if (cast.length) {
    const label = document.createElement('div');
    label.className = 'cast-label';
    label.textContent = 'CAST';
    extraEl.appendChild(label);

    const row = document.createElement('div');
    row.className = 'cast-row';
    for (const person of cast) {
      const item = document.createElement('div');
      item.className = 'cast-item clickable-cast';
      item.title = `View ${person.name}`;

      if (person.profile_path) {
        const img = document.createElement('img');
        img.src = `${IMG_PROFILE}${person.profile_path}`;
        img.alt = person.name;
        img.loading = 'lazy';
        item.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'cast-photo-ph';
        ph.textContent = (person.name[0] || '?').toUpperCase();
        item.appendChild(ph);
      }

      const name = document.createElement('span');
      name.className = 'cast-name';
      name.textContent = person.name;
      item.appendChild(name);

      const char = document.createElement('span');
      char.className = 'cast-char';
      char.textContent = person.character || '';
      item.appendChild(char);

      item.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('person-open', { detail: { id: person.id } }));
      });

      row.appendChild(item);
    }
    extraEl.appendChild(row);
  }
}

function renderSeasons(detail, showId) {
  allSeasons = (detail.seasons || []).filter(s =>
    s.season_number > 0 &&
    s.air_date &&
    s.air_date <= TODAY
  );

  if (!allSeasons.length) {
    document.getElementById('modal-seasons').innerHTML =
      '<p class="modal-error">No released seasons available.</p>';
    return;
  }

  const container = document.getElementById('modal-seasons');
  container.innerHTML = '';

  const label = document.createElement('label');
  label.className = 'season-label';
  label.htmlFor = 'season-select';
  label.textContent = 'Season';
  container.appendChild(label);

  const select = document.createElement('select');
  select.id = 'season-select';
  select.className = 'season-select';
  for (const s of allSeasons) {
    const opt = document.createElement('option');
    opt.value = s.season_number;
    opt.textContent = `Season ${s.season_number}`;
    select.appendChild(opt);
  }
  select.value = allSeasons[allSeasons.length - 1].season_number;
  container.appendChild(select);

  const progress = document.createElement('div');
  progress.id = 'season-progress';
  progress.className = 'season-progress';
  container.appendChild(progress);

  select.addEventListener('change', () => {
    loadEpisodes(showId, Number(select.value));
  });

  loadEpisodes(showId, Number(select.value));
}

async function loadEpisodes(showId, seasonNumber) {
  currentSeasonNumber = seasonNumber;
  document.getElementById('modal-episodes').innerHTML =
    '<div style="display:flex;justify-content:center;padding:20px"><div class="spinner"></div></div>';
  try {
    const season = await fetchSeasonDetail(showId, seasonNumber);
    renderEpisodes(season, showId, seasonNumber);
  } catch {
    document.getElementById('modal-episodes').innerHTML =
      '<p class="modal-error">Failed to load episodes.</p>';
  }
}

function renderEpisodes(season, showId, seasonNumber) {
  allEpisodes = (season.episodes || []).filter(e => e.air_date && e.air_date <= TODAY);
  currentEpisodeIndex = -1;

  const seasonData = allSeasons.find(s => s.season_number === seasonNumber);
  const totalEps = seasonData?.episode_count || 0;
  const airedEps = allEpisodes.length;
  const progressEl = document.getElementById('season-progress');
  if (progressEl && totalEps > 0) {
    const pct = Math.round((airedEps / totalEps) * 100);
    progressEl.innerHTML = `
      <span class="season-progress-text">${airedEps}/${totalEps} eps</span>
      <div class="season-progress-track"><div class="season-progress-fill" style="width:${pct}%"></div></div>
    `;
  }

  if (!allEpisodes.length) {
    document.getElementById('modal-episodes').innerHTML =
      '<p class="modal-error">No released episodes in this season yet.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'episode-list';

  for (let i = 0; i < allEpisodes.length; i++) {
    const ep = allEpisodes[i];
    const item = document.createElement('div');
    item.className = 'episode-item';
    item.dataset.index = i;
    item.innerHTML = `
      <span class="ep-num">E${String(ep.episode_number).padStart(2, '0')}</span>
      <span class="ep-title">${esc(ep.name || `Episode ${ep.episode_number}`)}</span>
      <svg class="ep-dl-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M12 3v13M5 13l7 7 7-7"/><line x1="3" y1="21" x2="21" y2="21"/></svg>
      <span class="ep-date">${ep.air_date || ''}</span>
    `;
    item.addEventListener('click', () => setActiveEpisode(i));

    const openPopover = (anchor) => {
      setActiveEpisode(i);
      showMirrorPopover(anchor, showId, seasonNumber, ep.episode_number);
    };

    item.querySelector('.ep-dl-icon').addEventListener('click', e => {
      e.stopPropagation();
      openPopover(e.currentTarget);
    });

    item.querySelector('.ep-title').addEventListener('click', e => {
      e.stopPropagation();
      openPopover(item.querySelector('.ep-dl-icon'));
    });

    list.appendChild(item);
  }

  document.getElementById('modal-episodes').innerHTML = '';
  document.getElementById('modal-episodes').appendChild(list);
}

function renderSimilar(shows) {
  const container = document.getElementById('modal-similar');
  if (!container || !shows.length) return;

  const items = shows.filter(s => s.poster_path).slice(0, 5);
  if (!items.length) return;

  container.innerHTML = '';
  const label = document.createElement('div');
  label.className = 'similar-label';
  label.textContent = 'Similar Shows';
  container.appendChild(label);

  const row = document.createElement('div');
  row.className = 'similar-row';
  for (const show of items) {
    const card = document.createElement('div');
    card.className = 'similar-card';
    card.title = show.name || '';
    const img = document.createElement('img');
    img.src = `${IMG_SMALL}${show.poster_path}`;
    img.alt = show.name || '';
    img.loading = 'lazy';
    card.appendChild(img);
    const name = document.createElement('span');
    name.className = 'similar-name';
    name.textContent = show.name || '';
    card.appendChild(name);
    card.addEventListener('click', () => openModal(show));
    row.appendChild(card);
  }
  container.appendChild(row);
}

function setActiveEpisode(index) {
  currentEpisodeIndex = index;
  document.querySelectorAll('.episode-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  const active = document.querySelector(`.episode-item[data-index="${index}"]`);
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function navigateSeason(delta) {
  const select = document.getElementById('season-select');
  if (!select) return;
  const idx = allSeasons.findIndex(s => s.season_number === currentSeasonNumber);
  const next = allSeasons[idx + delta];
  if (!next) return;
  select.value = next.season_number;
  loadEpisodes(currentShowId, next.season_number);
}

function handleModalKey(e) {
  const modal = document.getElementById('modal');
  if (!modal.classList.contains('open')) return;

  switch (e.key) {
    case 'Escape': closeModal(); break;
    case 'ArrowDown': {
      e.preventDefault();
      if (allEpisodes.length) {
        if (currentEpisodeIndex === -1) setActiveEpisode(0);
        else setActiveEpisode(Math.min(currentEpisodeIndex + 1, allEpisodes.length - 1));
      }
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      if (allEpisodes.length && currentEpisodeIndex > 0) setActiveEpisode(currentEpisodeIndex - 1);
      break;
    }
    case 'ArrowRight': { e.preventDefault(); navigateSeason(1); break; }
    case 'ArrowLeft':  { e.preventDefault(); navigateSeason(-1); break; }
    case 'Enter': {
      if (currentEpisodeIndex >= 0 && allEpisodes[currentEpisodeIndex]) {
        const ep = allEpisodes[currentEpisodeIndex];
        window.open(TV_MIRRORS[0].url(currentShowId, currentSeasonNumber, ep.episode_number), '_blank', 'noopener');
      }
      break;
    }
  }
}

function initSwipe(box) {
  let startX = 0, startY = 0;

  box.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  box.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy > 80) closeModal();
    } else {
      if (Math.abs(dx) < 50) return;
      if (dx < 0) {
        if (allEpisodes.length) {
          if (currentEpisodeIndex === -1) setActiveEpisode(0);
          else if (currentEpisodeIndex < allEpisodes.length - 1) setActiveEpisode(currentEpisodeIndex + 1);
        }
      } else {
        if (currentEpisodeIndex > 0) setActiveEpisode(currentEpisodeIndex - 1);
      }
    }
  }, { passive: true });
}

export function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  try { sessionStorage.removeItem('ds-modal'); } catch {}
  currentShowId = null;
  allEpisodes = [];
  currentEpisodeIndex = -1;
  hideMirrorPopover();
  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
}

export function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', handleModalKey);
  initSwipe(document.querySelector('#modal .modal-box'));

  document.addEventListener('click', e => {
    const pop = document.getElementById('ep-mirror-popover');
    if (pop && pop.classList.contains('open') && !pop.contains(e.target)) {
      hideMirrorPopover();
    }
  });

  document.querySelector('#modal .modal-box').addEventListener('scroll', hideMirrorPopover, { passive: true });
}

let currentPopoverAnchor = null;

function showMirrorPopover(anchor, showId, season, epNum) {
  let pop = document.getElementById('ep-mirror-popover');

  // Toggle: same anchor while open → close
  if (pop && pop.classList.contains('open') && currentPopoverAnchor === anchor) {
    hideMirrorPopover();
    return;
  }
  currentPopoverAnchor = anchor;

  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'ep-mirror-popover';
    pop.className = 'ep-mirror-popover';
    TV_MIRRORS.forEach(m => {
      const a = document.createElement('a');
      a.className = 'ep-mirror-opt';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = m.label;
      a.addEventListener('click', () => hideMirrorPopover());
      pop.appendChild(a);
    });
    document.body.appendChild(pop);
  }

  pop.querySelectorAll('.ep-mirror-opt').forEach((a, i) => {
    a.href = TV_MIRRORS[i].url(showId, season, epNum);
  });

  const rect = anchor.getBoundingClientRect();
  pop.style.top = `${rect.bottom + 6}px`;
  pop.style.right = `${window.innerWidth - rect.right}px`;
  pop.style.left = 'auto';
  pop.classList.add('open');
}

function hideMirrorPopover() {
  const pop = document.getElementById('ep-mirror-popover');
  if (pop) pop.classList.remove('open');
  currentPopoverAnchor = null;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
