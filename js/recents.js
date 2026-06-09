const KEY = 'ds-recents';
const MAX = 20;
export const IMG_SMALL = 'https://image.tmdb.org/t/p/w185';

export function addRecent(item, tab) {
  const entry = {
    id: item.id,
    tab,
    title: tab === 'movies' ? (item.title || '') : (item.name || ''),
    poster_path: item.poster_path || null,
    name: item.name,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    overview: item.overview,
  };
  const list = getRecents().filter(r => !(r.id === item.id && r.tab === tab));
  list.unshift(entry);
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch {}
}

export function getRecents() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearRecents() {
  localStorage.removeItem(KEY);
}

export function renderRecents(onItemClick) {
  const section = document.getElementById('recents-section');
  const grid = document.getElementById('recents-grid');
  if (!section || !grid) return;

  const list = getRecents();
  if (!list.length) { section.hidden = true; return; }

  section.hidden = false;
  grid.innerHTML = '';

  for (const item of list) {
    const card = document.createElement('div');
    card.className = 'recent-card';
    card.title = item.title;

    if (item.poster_path) {
      const img = document.createElement('img');
      img.src = `${IMG_SMALL}${item.poster_path}`;
      img.alt = item.title;
      img.loading = 'lazy';
      card.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'recent-placeholder';
      ph.textContent = (item.title[0] || '?').toUpperCase();
      card.appendChild(ph);
    }

    const label = document.createElement('span');
    label.className = 'recent-title';
    label.textContent = item.title;
    card.appendChild(label);

    card.addEventListener('click', () => onItemClick(item));

    grid.appendChild(card);
  }
}
