export interface Album {
  deezer_id: string;
  title: string;
  artist_name: string;
  cover_url: string;
  rating?: number;
}
export interface Track {
  id: string;
  title: string;
  duration: number;
  track_position: number;
}
export interface AlbumDetail extends Album {
  artist_id: string;
  release_date: string;
  tracks: Track[];
}

export interface SearchResponse {
  query: string;
  page: number;
  total: number;
  results: Album[];
}

export async function request<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
    ...rest,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try { msg += `: ${await res.text()}`; } catch {}
    throw new Error(msg);
  }
  return (res.status === 204 ? (undefined as T) : ((await res.json()) as T));
}

export const api = {
  login(username: string, password: string) {
    return request<{ ok: true }>("/api/login", { method: "POST", json: { username, password } });
  },
  register(username: string, password: string) {
    return request<{ ok: true; user: { id: string; user_name: string } }>(
      "/api/register",
      { method: "POST", json: { username, password } }
    );
  },
  me() {
    return request<{ authenticated: boolean; user?: { id: string; user_name: string } }>(
      "/api/me"
    );
  },
  logout() {
    return request<{ ok: true }>("/api/logout", { method: "POST" });
  },

  searchAlbums(query: string, page = 1, limit = 5) {
    const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
    return request<SearchResponse>(`/v1/search/albums?${params.toString()}`);
  },
  getAlbumDetails(albumId: string) {
    return request<AlbumDetail>(`/v1/albums/${albumId}`);
  },
  getMyAlbums() {
    return request<Album[]>("/v1/me/albums");
  },
  getRandomAlbums(count: number = 6) {
    return request<Album[]>(`/v1/albums/random?count=${count}`);
  },
  addAlbum(albumId: string) {
    return request<{ ok: boolean; message?: string }>(
      `/v1/albums/${albumId}/add`,
      { method: "POST" }
    );
  },
  removeAlbum(albumId: string) {
    return request<{ ok: boolean; message?: string }>(
      `/v1/albums/${albumId}/remove`,
      { method: "POST" }
    );
  },
  rateAlbum(albumId: string, rating: number) {
    return request<{ ok: boolean; message?: string }>(
      `/v1/albums/${albumId}/rate`,
      { method: "POST", json: { rating } }
    );
  },
  getUserRating(albumId: string) {
    return request<{ rating: number | null }>(`/v1/albums/${albumId}/rating`);
  },
  getRatedAlbums() {
    return request<Album[]>("/v1/me/rated-albums");
  },
  removeRating(albumId: string) {
    return request<{ ok: boolean; message?: string }>(
      `/v1/albums/${albumId}/rating`,
      { method: "DELETE" }
    );
  },
};
