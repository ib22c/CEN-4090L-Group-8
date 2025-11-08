import requests
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import atexit
from datetime import datetime, timedelta
from flask_cors import CORS, cross_origin 
#Added for login token
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from traceback import format_exc

app = Flask(__name__)
# --- AUTH/SESSION CONFIG (ADD) ---
app.config["SECRET_KEY"] = "dev-change-me"        # TODO: read from env in prod
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"     # 'None' (+ HTTPS) if cross-site
#app.config["SESSION_COOKIE_SAMESITE"] = "None"    # Ivan added this line to try make the site work
app.config["SESSION_COOKIE_SECURE"] = False       # True in HTTPS prod

# Allow React dev server to send/receive cookies
CORS(app, supports_credentials=True, resources={
    r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}
})

DB_CONFIG = {
    'dbname': 'capstonemusic',
    'user': 'cambender',
    'password': '123456',
    'host': '127.0.0.1',
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

class UserObj(UserMixin):
    def __init__(self, row):
        # row is a dict with keys: user_id, user_name, user_password
        self.id = str(row["user_id"])
        self.user_name = row["user_name"]
        self.password_hash = row["user_password"]

def _row_to_user(row):
    return UserObj(row) if row else None

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id: str):
    try:
        return find_user_by_id(int(user_id))
    except Exception:
        return None

def find_user_by_username(username: str):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT user_id, user_name, user_password
                FROM app_user
                WHERE lower(user_name) = lower(%s)
                LIMIT 1
            """, (username,))
            row = cur.fetchone()
            return _row_to_user(row)
    finally:
        conn.close()

def find_user_by_id(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT user_id, user_name, user_password
                FROM app_user
                WHERE user_id = %s
                LIMIT 1
            """, (user_id,))
            row = cur.fetchone()
            return _row_to_user(row)
    finally:
        conn.close()

def create_user(username: str, password: str):
    """Uses DB identity to auto-generate user_id; stores bcrypt hash."""
    pw_hash = generate_password_hash(password)
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO app_user (user_name, user_password)
                VALUES (%s, %s)
                RETURNING user_id, user_name, user_password
            """, (username, pw_hash))
            row = cur.fetchone()
        conn.commit()
        return _row_to_user(row)
    finally:
        conn.close()


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
#added to just check if it is alive
@app.get("/api/ping")
def api_ping():
    return "pong", 200, {"Content-Type": "text/plain"}
def _json_error(msg: str, code: int = 500):
    # Always return JSON on errors so the frontend can show messages
    return jsonify({"error": msg}), code
@app.errorhandler(Exception)
def _handle_unhandled(e):
    # print full traceback to the Flask console
    print("UNHANDLED EXCEPTION:\n", format_exc())
    # return a JSON error so the browser doesn't choke on empty 500 bodies
    return _json_error(str(e), 500)


@app.get("/api/health")
def api_health():
    return jsonify({"ok": True})

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
                release_date = album_data.get('release_date', None)
                
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
                    INSERT INTO album (album_id, author_id, genre_id, album_name, album_rating, release_date)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING album_id
                    """,
                    (deezer_album_id, author_id, genre_id, album_data['title'], None, release_date)
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
@app.post("/api/register")
#@cross_origin(origins=["http://localhost:5173","http://127.0.0.1:5173"], supports_credentials=True)
def api_register():
    try:
        data = request.get_json(force=True)
        username = data["username"].strip()
        password = data["password"]

        if not username or not password:
            return _json_error("username and password required", 400)

        if find_user_by_username(username):
            return _json_error("Username already taken", 409)

        user = create_user(username, password)
        if not user:
            return _json_error("Failed to create user", 500)

        login_user(user, remember=True)
        return jsonify({"ok": True, "user": {"id": user.id, "user_name": user.user_name}})
    except Exception as e:
        print("REGISTER ERROR:\n", format_exc())
        return _json_error(f"register_failed: {e}", 500)


@app.post("/api/login")
def api_login():
    try:
        data = request.get_json(force=True)
        username = data["username"].strip()
        password = data["password"]

        if not username or not password:
            return _json_error("username and password required", 400)

        user = find_user_by_username(username)
        if not user or not check_password_hash(user.password_hash, password):
            return _json_error("Invalid credentials", 401)

        login_user(user, remember=True)
        return jsonify({"ok": True})
    except Exception as e:
        print("LOGIN ERROR:\n", format_exc())
        return _json_error(f"login_failed: {e}", 500)


@app.post("/api/logout")
@login_required
def api_logout():
    try:
        logout_user()
        return jsonify({"ok": True})
    except Exception as e:
        print("LOGOUT ERROR:\n", format_exc())
        return _json_error(f"logout_failed: {e}", 500)


@app.get("/api/me")
def api_me():
    try:
        if current_user.is_authenticated:
            return jsonify({
                "authenticated": True,
                "user": {"id": current_user.id, "user_name": current_user.user_name}
            })
        return jsonify({"authenticated": False})
    except Exception as e:
        print("ME ERROR:\n", format_exc())
        return _json_error(f"me_failed: {e}", 500)
'''
@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get("Origin")
    if origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return resp
'''


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
            'release_date': None  # Will be fetched when user clicks on album
        }
        session_data.append(full_album_data)
        
        display_data = {
            'deezer_id': str(album['id']),
            'title': album['title'],
            'artist_name': album['artist']['name'],
            'cover_url': album.get('cover_medium')
        }
        display_results.append(display_data)
    
    session_key = f"{query}:{page}"
    store_search_session(session_key, session_data)
    
    return jsonify({
        'query': query,
        'page': page,
        'total': deezer_response.get('total', 0),
        'results': display_results
    })

@app.route('/v1/albums/<album_id>', methods=['GET'])
def select_album(album_id):
    """
    Get full album details including tracklist when user clicks on an album.
    Fetches release_date, tracks from Deezer, and saves to database.
    """
    stored_album_data = get_from_search_session(album_id)
    if not stored_album_data:
        return jsonify({
            'error': 'Album not found in recent search results. Please search again.'
        }), 404
    
    # Fetch full album details to get release_date
    try:
        full_album_url = f"https://api.deezer.com/album/{album_id}"
        full_album_response = requests.get(full_album_url, timeout=10)
        full_album_response.raise_for_status()
        full_album = full_album_response.json()
        release_date = full_album.get('release_date')
        stored_album_data['release_date'] = release_date
    except Exception as e:
        print(f"Error fetching full album details for {album_id}: {e}")
    
    # Fetch tracks
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
        
        save_album_to_db(complete_album)
        
        return jsonify(complete_album)
        
    except Exception as e:
        print(f"Error fetching tracks from Deezer: {e}")
        return jsonify({
            'error': 'Failed to fetch album tracks from Deezer'
        }), 500


@app.post("/v1/albums/<album_id>/add")
@login_required
def add_album(album_id):
    """
    Add album to the current user's want_to_listen list.
    Album should already exist in DB.
    """
    try:
        user_id = int(current_user.id)

        with get_db_connection() as conn:
            with conn.cursor() as cur:

                # Verify album exists
                cur.execute("""
                    SELECT album_id
                    FROM album
                    WHERE album_id = %s
                    LIMIT 1
                """, (album_id,))
                row = cur.fetchone()
                if not row:
                    return _json_error("Album not found in DB", 404)

                # Check if already exists
                cur.execute("""
                    SELECT 1
                    FROM want_to_listen
                    WHERE user_id = %s AND album_id = %s
                    LIMIT 1
                """, (user_id, album_id))
                exists = cur.fetchone()

                if exists:
                    return jsonify({"ok": True, "message": "Album already in list"})

                # Insert new
                cur.execute("""
                    INSERT INTO want_to_listen (user_id, album_id)
                    VALUES (%s, %s)
                """, (user_id, album_id))

            conn.commit()

        return jsonify({"ok": True, "message": "Album added to your list"})

    except Exception as e:
        print("ADD ALBUM ERROR:", e)
        return _json_error(f"add_album_failed: {e}", 500)



if __name__ == '__main__':
    app.run(debug=True, host="127.0.0.1", port=5000) # auto-generates HTTPS cert
