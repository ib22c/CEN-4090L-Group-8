const API_BASE_URL = 'http://127.0.0.1:5000';

export interface Album {
  deezer_id: string;
  title: string;
  artist_name: string;
  cover_url: string;
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

export const api = {
  async searchAlbums(query: string, page = 1, limit = 5): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${API_BASE_URL}/v1/search/albums?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search albums');
    }
    return response.json();
  },

  async getAlbumDetails(albumId: string): Promise<AlbumDetail> {
    const response = await fetch(`${API_BASE_URL}/v1/albums/${albumId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch album details');
    }
    return response.json();
  },
};
