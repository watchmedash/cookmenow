const API_KEY = '4f599baa15d072c9de346b2816a131b8';
const BASE = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
export const TODAY = new Date().toISOString().split('T')[0];

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, expires } = JSON.parse(raw);
    if (Date.now() > expires) { sessionStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function cacheSet(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, expires: Date.now() + CACHE_TTL }));
  } catch { /* storage full — non-critical */ }
}

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set('api_key', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') {
      url.searchParams.set(k, v);
    }
  }

  const key = url.pathname + url.search;
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await fetch(url);
  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) throw new Error(`TMDB_${res.status}`);
  const data = await res.json();
  cacheSet(key, data);
  return data;
}

export async function fetchPopular(tab, page = 1) {
  return tmdb(tab === 'movies' ? '/movie/popular' : '/tv/popular', { page });
}

export async function searchContent(tab, query, page = 1) {
  return tmdb(tab === 'movies' ? '/search/movie' : '/search/tv', {
    query,
    page,
    include_adult: false,
  });
}

function mapSortBy(sortBy, tab) {
  if (tab === 'tv') {
    return sortBy
      .replace('release_date', 'first_air_date')
      .replace('original_title', 'name');
  }
  return sortBy;
}

export async function discoverContent(tab, filters, page = 1) {
  const path = tab === 'movies' ? '/discover/movie' : '/discover/tv';
  const dateGteKey = tab === 'movies' ? 'primary_release_date.gte' : 'first_air_date.gte';
  const dateLteKey = tab === 'movies' ? 'primary_release_date.lte' : 'first_air_date.lte';
  const params = {
    page,
    include_adult: false,
    [dateLteKey]: TODAY,
    sort_by: mapSortBy(filters.sortBy || 'popularity.desc', tab),
  };
  if (filters.genre)     params.with_genres = filters.genre;
  if (filters.yearFrom)  params[dateGteKey] = `${filters.yearFrom}-01-01`;
  if (filters.yearTo)    params[dateLteKey] = `${filters.yearTo}-12-31`;
  if (filters.minRating) params['vote_average.gte'] = filters.minRating;
  if (filters.language)  params.with_original_language = filters.language;
  return tmdb(path, params);
}

export async function fetchGenres(tab) {
  const data = await tmdb(tab === 'movies' ? '/genre/movie/list' : '/genre/tv/list');
  return data.genres;
}

export async function fetchShowDetail(showId) {
  return tmdb(`/tv/${showId}`);
}

export async function fetchSeasonDetail(showId, seasonNumber) {
  return tmdb(`/tv/${showId}/season/${seasonNumber}`);
}

export async function fetchSimilarShows(showId) {
  return tmdb(`/tv/${showId}/similar`);
}
