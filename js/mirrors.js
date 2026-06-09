// ─── Mirror Configuration ────────────────────────────────────────────────────
// This is the only file you need to edit to add, remove, or change mirrors.
// Changes here automatically apply to:
//   • Movie modal download buttons
//   • Movie card right-click menu (gallery, similar movies, person credits)
//   • TV episode download popover
//
// Each entry has:
//   label — text shown on the button / menu item
//   url   — function that returns the full link

export const MOVIE_MIRRORS = [
  {
    label: 'Mirror 1',
    url: id => `https://vidvault.ru/movie/${id}`,
  },
  {
    label: 'Mirror 2',
    url: id => `https://02moviedownloader.site/api/download/movie/${id}`,
  },
  {
    label: 'Mirror 3',
    url: id => `https://db.screenopps.com/db/movie/${id}`,
  },
  {
    label: 'Mirror 4',
    url: id => `https://02moviedownloader.top/api/download/movie/${id}`,
  },
];

export const TV_MIRRORS = [
  {
    label: 'Mirror 1',
    url: (id, season, episode) => `https://vidvault.ru/tv/${id}/${season}/${episode}`,
  },
  {
    label: 'Mirror 2',
    url: (id, season, episode) => `https://02moviedownloader.site/api/download/tv/${id}/${season}/${episode}`,
  },
  {
    label: 'Mirror 3',
    url: (id, season, episode) => `https://db.screenopps.com/db/tv/${id}/${season}/${episode}`,
  },
  {
    label: 'Mirror 4',
    url: (id, season, episode) => `https://02moviedownloader.top/api/download/tv/${id}/${season}/${episode}`,
  },
];
