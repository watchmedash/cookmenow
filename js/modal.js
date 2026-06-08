import { fetchShowDetail, fetchSeasonDetail, IMG_BASE, TODAY } from './api.js';

let currentShowId = null;

export async function openModal(show) {
  currentShowId = show.id;
  const modal = document.getElementById('modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderBase(show);

  try {
    const detail = await fetchShowDetail(show.id);
    renderSeasons(detail, show.id);
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
}

function renderSeasons(detail, showId) {
  const seasons = (detail.seasons || []).filter(s =>
    s.season_number > 0 &&
    s.air_date &&
    s.air_date <= TODAY
  );

  if (!seasons.length) {
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
  for (const s of seasons) {
    const opt = document.createElement('option');
    opt.value = s.season_number;
    opt.textContent = `Season ${s.season_number}`;
    select.appendChild(opt);
  }
  select.value = seasons[seasons.length - 1].season_number;
  container.appendChild(select);

  select.addEventListener('change', () => {
    loadEpisodes(showId, Number(select.value));
  });

  loadEpisodes(showId, Number(select.value));
}

async function loadEpisodes(showId, seasonNumber) {
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
  const episodes = (season.episodes || []).filter(e => e.air_date && e.air_date <= TODAY);

  if (!episodes.length) {
    document.getElementById('modal-episodes').innerHTML =
      '<p class="modal-error">No released episodes in this season yet.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'episode-list';

  for (const ep of episodes) {
    const item = document.createElement('div');
    item.className = 'episode-item';
    item.innerHTML = `
      <span class="ep-num">E${String(ep.episode_number).padStart(2, '0')}</span>
      <span class="ep-title">${esc(ep.name || `Episode ${ep.episode_number}`)}</span>
      <span class="ep-date">${ep.air_date || ''}</span>
    `;
    item.addEventListener('click', () => {
      window.open(
        `https://vidvault.ru/tv/${showId}/${seasonNumber}/${ep.episode_number}`,
        '_blank',
        'noopener'
      );
    });
    list.appendChild(item);
  }

  document.getElementById('modal-episodes').innerHTML = '';
  document.getElementById('modal-episodes').appendChild(list);
}

export function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  currentShowId = null;
}

export function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
