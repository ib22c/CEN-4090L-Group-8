ALTER TABLE music.song DROP CONSTRAINT IF EXISTS fk_song_album_id;
ALTER TABLE music.want_to_listen DROP CONSTRAINT IF EXISTS fk_album_id;
ALTER TABLE music.user_rating DROP CONSTRAINT IF EXISTS fk_album_id;

ALTER TABLE music.album ALTER COLUMN album_id TYPE BIGINT;
ALTER TABLE music.song ALTER COLUMN song_id TYPE BIGINT;
ALTER TABLE music.song ALTER COLUMN album_id TYPE BIGINT;
ALTER TABLE music.author ALTER COLUMN author_id TYPE BIGINT;
ALTER TABLE music.want_to_listen ALTER COLUMN album_id TYPE BIGINT;
ALTER TABLE music.user_rating ALTER COLUMN album_id TYPE BIGINT;

ALTER TABLE music.song 
    ADD CONSTRAINT fk_song_album_id 
    FOREIGN KEY (album_id) REFERENCES music.album(album_id);

ALTER TABLE music.want_to_listen 
    ADD CONSTRAINT fk_album_id 
    FOREIGN KEY (album_id) REFERENCES music.album(album_id);

ALTER TABLE music.user_rating 
    ADD CONSTRAINT fk_album_id 
    FOREIGN KEY (album_id) REFERENCES music.album(album_id);
