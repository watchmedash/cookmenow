import { fetchPersonDetail } from './api.js';

const IMG_PROFILE = 'https://image.tmdb.org/t/p/w185';
const IMG_POSTER  = 'https://image.tmdb.org/t/p/w185';

let savedScrollY = 0;

export async function openPersonModal(personId) {
  savedScrollY = window.scrollY;
  const modal = document.getElementById('person-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  try { sessionStorage.setItem('ds-modal', JSON.stringify({ type: 'person', id: personId })); } catch {}


  const photo = document.getElementById('person-modal-photo');
  photo.src = '';
  photo.style.display = 'none';
  document.getElementById('person-modal-name').textContent = 'Loading…';
  document.getElementById('person-modal-meta').textContent = '';
  document.getElementById('person-modal-bio').textContent = '';
  document.getElementById('person-modal-credits').innerHTML =
    '<div style="display:flex;justify-content:center;padding:24px"><div class="spinner"></div></div>';

  try {
    const person = await fetchPersonDetail(personId);
    renderPerson(person);
  } catch {
    document.getElementById('person-modal-credits').innerHTML =
      '<p class="modal-error" style="padding:16px">Failed to load person details.</p>';
  }
}

function renderPerson(person) {
  const photo = document.getElementById('person-modal-photo');
  if (person.profile_path) {
    photo.src = `${IMG_PROFILE}${person.profile_path}`;
    photo.alt = person.name || '';
    photo.style.display = '';
    photo.loading = 'eager';
  } else {
    photo.style.display = 'none';
  }

  document.getElementById('person-modal-name').textContent = person.name || '';

  const parts = [];
  if (person.birthday) parts.push(`Born ${person.birthday.slice(0, 10)}`);
  if (person.place_of_birth) parts.push(person.place_of_birth);
  if (person.known_for_department) parts.push(person.known_for_department);
  document.getElementById('person-modal-meta').textContent = parts.join(' · ');

  const bio = person.biography || '';
  document.getElementById('person-modal-bio').textContent = bio;

  const seen = new Set();
  const credits = (person.combined_credits?.cast || [])
    .filter(c => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return c.poster_path;
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 24);

  const container = document.getElementById('person-modal-credits');
  container.innerHTML = '';

  if (!credits.length) {
    container.innerHTML = '<p class="modal-error" style="padding:16px;text-align:center">No credits found.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'person-credits-grid';

  for (const credit of credits) {
    const card = document.createElement('div');
    card.className = 'person-credit-card';
    card.title = credit.title || credit.name || '';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'person-credit-img-wrap loading';

    const img = document.createElement('img');
    img.src = `${IMG_POSTER}${credit.poster_path}`;
    img.alt = credit.title || credit.name || '';
    img.loading = 'lazy';
    img.onload = () => imgWrap.classList.remove('loading');
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    const name = document.createElement('span');
    name.className = 'person-credit-name';
    name.textContent = credit.title || credit.name || '';
    card.appendChild(name);

    card.addEventListener('click', () => {
      closePersonModal();
      // Close any parent modal that was open underneath person modal
      document.getElementById('movie-modal')?.classList.remove('open');
      document.getElementById('modal')?.classList.remove('open');
      if (credit.media_type === 'movie') {
        document.dispatchEvent(new CustomEvent('movie-open', { detail: { item: credit } }));
      } else {
        document.dispatchEvent(new CustomEvent('tv-open', { detail: { item: credit } }));
      }
    });

    grid.appendChild(card);
  }

  container.appendChild(grid);
}

export function closePersonModal() {
  document.getElementById('person-modal').classList.remove('open');
  document.body.style.overflow = '';
  try { sessionStorage.removeItem('ds-modal'); } catch {}
  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
}

export function initPersonModal() {
  document.getElementById('person-modal-close').addEventListener('click', closePersonModal);
  document.getElementById('person-modal-backdrop').addEventListener('click', closePersonModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('person-modal')?.classList.contains('open')) {
      closePersonModal();
    }
  });
}
