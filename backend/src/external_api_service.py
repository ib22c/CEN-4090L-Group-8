import requests
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import atexit
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'dbname': 'capstonemusic',
    'user': 'cambender',
    'password': '123456',
    'host': 'localhost',
    'port': '5432'
}

SESSION_CACHE = {}
CACHE_EXPIRY_MINUTES = 5

def get_db_connection():
    """Create database connection with music schema set"""
    conn = psycopg2.connect(**DB_CONFIG)
    with conn.cursor() as cur:
        cur.execute("SET search_path TO music, public;")
    conn.commit()
    return conn

def store_search_session(key, data):
    """Store search results temporarily in memory with timestamp"""
    SESSION_CACHE[key] = {
        'data': data,
        'timestamp': datetime.now()
    }

def get_from_search_session(album_id):
    """Retrieve album data from session cache by deezer_id"""
    clean_expired_cache()
    
    for key, cache_entry in SESSION_CACHE.items():
        for album in cache_entry['data']:
            if str(album['deezer_id']) == str(album_id):
                return album
    return None

def clean_expired_cache():
    """Remove expired cache entries and save them to database"""
    now = datetime.now()
    expired_keys = []
    
    for key, cache_entry in SESSION_CACHE.items():
        if now - cache_entry['timestamp'] > timedelta(minutes=CACHE_EXPIRY_MINUTES):
            expired_keys.append(key)
            for album in cache_entry['data']:
                save_album_to_db(album)
    
    for key in expired_keys:
        del SESSION_CACHE[key]
        print(f"Cleaned up expired cache entry: {key}")

def fetch_deezer_albums(query, page, limit):
    """Fetch albums from Deezer API"""
    url = f"https://api.deezer.com/search/album?q={query}&index={(page-1)*limit}&limit={limit}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching from Deezer: {e}")
        return {'data': [], 'total': 0}

def get_or_create_author(cursor, artist_name, artist_id):
    """Get existing author or create new one using Deezer artist_id"""
    cursor.execute(
        "SELECT author_id FROM author WHERE author_id = %s LIMIT 1",
        (int(artist_id),)
    )
    result = cursor.fetchone()
    
    if result:
        return result[0]
    
    # Create new artist in database using the artist_id we get from Deezer.
    cursor.execute(
        "INSERT INTO author (author_id, author_name) VALUES (%s, %s) RETURNING author_id",
        (int(artist_id), artist_name)
    )
    return cursor.fetchone()[0]

def get_or_create_genre(cursor, genre_id, genre_name='Unknown'):
    """Get existing genre or create new one using Deezer genre_id"""
    if not genre_id:
        genre_id = 0   # Need to figure out where to get genre information on Deezer.
    
    cursor.execute(
        "SELECT genre_id FROM genre WHERE genre_id = %s LIMIT 1",
        (int(genre_id),)
    )
    result = cursor.fetchone()
    
    if result:
        return result[0]
    
    # Create new genre with Deezer genre_id
    cursor.execute(
        "INSERT INTO genre (genre_id, genre_name) VALUES (%s, %s) RETURNING genre_id",
        (int(genre_id), genre_name)
    )
    return cursor.fetchone()[0]

def save_album_to_db(album_data):
    """Save album and its songs to the database using Deezer IDs"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                deezer_album_id = int(album_data['deezer_id'])
                deezer_artist_id = int(album_data['artist_id'])
                deezer_genre_id = album_data.get('genre_id', 0)
                
                author_id = get_or_create_author(
                    cur, 
                    album_data['artist_name'],
                    deezer_artist_id
                )
                
                genre_id = get_or_create_genre(
                    cur, 
                    deezer_genre_id,
                    'Unknown'
                )
                
                cur.execute(
                    "SELECT album_id FROM album WHERE album_id = %s",
                    (deezer_album_id,)
                )
                existing = cur.fetchone()
                
                if existing:
                    album_id = existing[0]
                    print(f"Album '{album_data['title']}' already exists with ID: {album_id}")
                    return album_id
                
                cur.execute(
                    """
                    INSERT INTO album (album_id, author_id, genre_id, album_name, album_rating)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING album_id
                    """,
                    (deezer_album_id, author_id, genre_id, album_data['title'], None)
                )
                album_id = cur.fetchone()[0]
                print(f"Saved album '{album_data['title']}' with ID: {album_id}")
                
                if 'tracks' in album_data and album_data['tracks']:
                    for track in album_data['tracks']:
                        deezer_track_id = int(track['id'])
                        
                        cur.execute(
                            "SELECT song_id FROM song WHERE song_id = %s",
                            (deezer_track_id,)
                        )
                        if cur.fetchone():
                            continue  
                        
                        cur.execute(
                            """
                            INSERT INTO song (song_id, author_id, album_id, song_name, song_num)
                            VALUES (%s, %s, %s, %s, %s)
                            """,
                            (
                                deezer_track_id,
                                author_id,
                                album_id,
                                track['title'],
                                track.get('track_position', 0)
                            )
                        )
                    print(f"Saved {len(album_data['tracks'])} tracks for album ID: {album_id}")
                
                conn.commit()
                return album_id
                
    except Exception as e:
        print(f"Error saving album to database: {e}")
        import traceback
        traceback.print_exc()
        return None

def save_all_cache_to_db():
    """Save all cached albums to database before shutdown"""
    print("Saving all cached albums to database...")
    for key, cache_entry in SESSION_CACHE.items():
        for album in cache_entry['data']:
            save_album_to_db(album)
    print("All cached albums saved to database")

atexit.register(save_all_cache_to_db) # If there are albums in the cache they will be saved to the database before Flask is closed.

@app.route('/v1/search/albums', methods=['GET'])
def search_albums():
    """
    Search for albums via Deezer API.
    Returns minimal display data and caches full data in memory.
    """
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))
    
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    deezer_response = fetch_deezer_albums(query, page, limit)
    
    session_data = []
    display_results = []
    
    for album in deezer_response.get('data', []):
        full_album_data = {
            'deezer_id': str(album['id']),
            'title': album['title'],
            'artist_name': album['artist']['name'],
            'artist_id': str(album['artist']['id']),
            'cover_url': album.get('cover_medium'),
            'release_date': album.get('release_date')
        }
        session_data.append(full_album_data) # Store all the album information except tracklist in cache.
        
        display_data = {
            'deezer_id': str(album['id']),
            'title': album['title'],
            'artist_name': album['artist']['name'],
            'cover_url': album.get('cover_medium')
        }
        display_results.append(display_data) # Return only what is needed for display to the user.
    
    session_key = f"{query}:{page}"
    store_search_session(session_key, session_data)
    
    return jsonify({
        'query': query,
        'page': page,
        'total': deezer_response.get('total', 0),
        'results': display_results
    })

@app.route('/v1/albums/<album_id>/select', methods=['GET'])
def select_album(album_id):
    """
    Get full album details including tracklist when user clicks on an album.
    Fetches tracks from Deezer, returns complete album data, and saves to database.
    """
    stored_album_data = get_from_search_session(album_id)
    if not stored_album_data:
        return jsonify({
            'error': 'Album not found in recent search results. Please search again.'
        }), 404
    
    tracks_url = f"https://api.deezer.com/album/{album_id}/tracks"
    try:
        tracks_response = requests.get(tracks_url, timeout=10)
        tracks_response.raise_for_status()
        tracks_data = tracks_response.json()
        
        formatted_tracks = []
        for track in tracks_data.get('data', []):
            formatted_tracks.append({
                'id': str(track['id']),
                'title': track['title'],
                'duration': track['duration'],
                'track_position': track.get('track_position', 0)
            })
        
        complete_album = {
            **stored_album_data,
            'tracks': formatted_tracks
        }
        
        save_album_to_db(complete_album) # Save the entire album with tracklist to database.  This flow can probably be improved.
        
        return jsonify(complete_album)
        
    except Exception as e:
        print(f"Error fetching tracks from Deezer: {e}")
        return jsonify({
            'error': 'Failed to fetch album tracks from Deezer'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
