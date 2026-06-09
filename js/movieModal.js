import { fetchMovieDetail, fetchSimilarMovies, IMG_BASE } from './api.js';
import { showMovieContextMenu } from './contextMenu.js';
import { MOVIE_MIRRORS } from './mirrors.js';

const IMG_PROFILE = 'https://image.tmdb.org/t/p/w185';
const IMG_POSTER  = 'https://image.tmdb.org/t/p/w185';

let savedScrollY = 0;

export async function openMovieModal(movie) {
  savedScrollY = window.scrollY;
  const modal = document.getElementById('movie-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  try { sessionStorage.setItem('ds-modal', JSON.stringify({ type: 'movie', id: movie.id })); } catch {}
  renderBase(movie);

  try {
    const detail = await fetchMovieDetail(movie.id);
    renderDetail(detail, movie.id);
  } catch {
    document.getElementById('movie-modal-trailer').innerHTML =
      '<div class="movie-trailer-none">Trailer unavailable</div>';
  }

  fetchSimilarMovies(movie.id)
    .then(data => renderSimilarMovies(data.results || []))
    .catch(() => {});
}

function renderBase(movie) {
  const title = movie.title || '';
  const year = (movie.release_date || '').slice(0, 4);
  const score = movie.vote_average || 0;
  const ratingClass = score >= 7 ? 'rating-green' : score >= 5 ? 'rating-yellow' : 'rating-red';

  document.getElementById('movie-modal-title').textContent = title;
  document.getElementById('movie-modal-year').textContent = year;

  const ratingEl = document.getElementById('movie-modal-rating');
  ratingEl.textContent = score > 0 ? score.toFixed(1) : 'N/A';
  ratingEl.className = `movie-modal-rating ${ratingClass}`;

  const poster = document.getElementById('movie-modal-poster');
  if (movie.poster_path) {
    poster.src = `${IMG_BASE}${movie.poster_path}`;
    poster.loading = 'eager';
    poster.decoding = 'async';
    poster.style.display = '';
  } else {
    poster.style.display = 'none';
  }
  poster.alt = title;

  document.getElementById('movie-modal-overview').textContent = movie.overview || '';
  const dlGroup = document.getElementById('movie-download-group');
  dlGroup.innerHTML = '';
  MOVIE_MIRRORS.forEach((m, i) => {
    const a = document.createElement('a');
    a.href = m.url(movie.id);
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = i === 0 ? 'movie-dl-btn movie-dl-primary' : 'movie-dl-btn';
    if (i === 0) {
      a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M12 3v13M5 13l7 7 7-7"/><line x1="3" y1="21" x2="21" y2="21"/></svg> ${m.label}`;
    } else {
      a.textContent = m.label;
    }
    dlGroup.appendChild(a);
  });
  document.getElementById('movie-modal-runtime').textContent = '';
  document.getElementById('movie-modal-genres').innerHTML = '';
  document.getElementById('movie-modal-cast').innerHTML = '';
  document.getElementById('movie-modal-similar').innerHTML = '';
}

function renderDetail(detail, movieId) {
  // Runtime
  if (detail.runtime) {
    const h = Math.floor(detail.runtime / 60);
    const m = detail.runtime % 60;
    document.getElementById('movie-modal-runtime').textContent =
      h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // Genres
  const genresEl = document.getElementById('movie-modal-genres');
  genresEl.innerHTML = (detail.genres || []).slice(0, 4)
    .map(g => `<span class="movie-genre-tag">${esc(g.name)}</span>`)
    .join('');

  // Overview (may be richer from detail)
  if (detail.overview) {
    document.getElementById('movie-modal-overview').textContent = detail.overview;
  }

  // Cast
  const cast = (detail.credits?.cast || []).slice(0, 6);
  const castEl = document.getElementById('movie-modal-cast');
  if (cast.length) {
    const label = document.createElement('div');
    label.className = 'cast-label';
    label.textContent = 'CAST';
    castEl.appendChild(label);

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
    castEl.appendChild(row);
  }
}

function renderSimilarMovies(movies) {
  const container = document.getElementById('movie-modal-similar');
  if (!container) return;
  const items = movies.filter(m => m.poster_path).slice(0, 5);
  if (!items.length) return;

  container.innerHTML = '';
  const label = document.createElement('div');
  label.className = 'similar-label';
  label.textContent = 'Related Movies';
  container.appendChild(label);

  const row = document.createElement('div');
  row.className = 'similar-row';
  for (const movie of items) {
    const card = document.createElement('div');
    card.className = 'similar-card';
    card.title = movie.title || '';

    const img = document.createElement('img');
    img.src = `${IMG_POSTER}${movie.poster_path}`;
    img.alt = movie.title || '';
    img.loading = 'lazy';
    card.appendChild(img);

    const name = document.createElement('span');
    name.className = 'similar-name';
    name.textContent = movie.title || '';
    card.appendChild(name);

    card.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('movie-open', { detail: { item: movie } }));
    });
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      showMovieContextMenu(e.clientX, e.clientY, movie.id);
    });

    row.appendChild(card);
  }
  container.appendChild(row);
}

export function closeMovieModal() {
  const modal = document.getElementById('movie-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  try { sessionStorage.removeItem('ds-modal'); } catch {}
  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
}

export function initMovieModal() {
  document.getElementById('movie-modal-close').addEventListener('click', closeMovieModal);
  document.getElementById('movie-modal-backdrop').addEventListener('click', closeMovieModal);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
