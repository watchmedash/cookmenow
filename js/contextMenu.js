import { MOVIE_MIRRORS } from './mirrors.js';

function getMovieMenu() {
  let menu = document.getElementById('movie-ctx-menu');
  if (menu) return menu;

  menu = document.createElement('div');
  menu.id = 'movie-ctx-menu';
  menu.className = 'movie-ctx-menu';
  MOVIE_MIRRORS.forEach(m => {
    const a = document.createElement('a');
    a.className = 'movie-ctx-opt';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = m.label;
    a.addEventListener('click', hideMovieContextMenu);
    menu.appendChild(a);
  });
  document.body.appendChild(menu);

  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) hideMovieContextMenu();
  });
  document.addEventListener('scroll', hideMovieContextMenu, { capture: true, passive: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideMovieContextMenu();
  });

  return menu;
}

export function showMovieContextMenu(x, y, movieId) {
  const menu = getMovieMenu();
  menu.querySelectorAll('.movie-ctx-opt').forEach((a, i) => {
    a.href = MOVIE_MIRRORS[i].url(movieId);
  });

  menu.style.visibility = 'hidden';
  menu.classList.add('open');
  const { offsetWidth: w, offsetHeight: h } = menu;
  menu.style.left = `${Math.min(x, window.innerWidth - w - 4)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - h - 4)}px`;
  menu.style.visibility = '';
}

export function hideMovieContextMenu() {
  document.getElementById('movie-ctx-menu')?.classList.remove('open');
}
