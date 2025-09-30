import requests
import time
from typing import Dict, List
import asyncio
from concurrent.futures import ThreadPoolExecutor


class externalService:

    #make sure to add v1 to all endpoints 

    @app.route('/api/search/albums', methods=['GET'])
def search_albums():
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))
    
    # Check if already cached in DB
    cached_results = check_db_cache(query, page, limit)
    if cached_results:
        return jsonify(cached_results)
    
    # Call Deezer API once
    deezer_response = fetch_deezer_albums(query, page, limit)
    
    # Store full data in session/memory, return minimal for display
    session_data = []
    display_results = []
    
    for album in deezer_response.get('data', []):
        # Store everything we got from Deezer
        full_album_data = {
            'deezer_id': str(album['id']),
            'title': album['title'],
            'artist_name': album['artist']['name'],
            'artist_id': str(album['artist']['id']),
            'cover_url': album.get('cover_medium'),
            'tracklist_url': album['tracklist'],  # This is the URL for tracks
            'release_date': album.get('release_date'),
            'genre_id': album.get('genre_id')
        }
        session_data.append(full_album_data)
        
        # Only return display data to frontend
        display_data = {
            'deezer_id': str(album['id']),
            'title': album['title'],
            'artist_name': album['artist']['name'],
            'cover_url': album.get('cover_medium')
        }
        display_results.append(display_data)
    
    # Store session data temporarily (Redis, session, or in-memory cache)
    store_search_session(f"{query}:{page}", session_data)
    
    return jsonify({
        'query': query,
        'page': page,
        'results': display_results
    })



# Phase 2: Get full album details when user selects
@app.route('/api/albums/<album_id>/select', methods=['GET'])
def select_album(album_id):
    # First check if we have it in DB
    cached_album = get_album_from_db(album_id)
    if cached_album:
        return jsonify(cached_album)
    
    # Get the stored session data
    stored_album_data = get_from_search_session(album_id)
    if not stored_album_data:
        return jsonify({'error': 'Album selection expired, please search again'}), 400
    
    # Make the tracklist request using the album ID
    tracks_url = f"https://api.deezer.com/album/{album_id}/tracks"
    tracks_response = requests.get(tracks_url)
    tracks_data = tracks_response.json()
    
    # Combine everything
    complete_album = {
        **stored_album_data,  # All the basic info we stored
        'tracks': format_tracks(tracks_data['data'])
    }
    
    # Save to database (can be async/background task for better UX)
    executor.submit(save_album_to_db, complete_album)

    return jsonify(complete_album)
