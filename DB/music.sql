-- change the file directory to where your file directory is on your local machine and change your password to whatever it is on your system. 
-- It is the password that you set up when you first install pgAdmin 4
-- I am running the two commands in cmd (terminal on mac). these are the commands for windows terminal. ask chatgpt for the equivalent on mac.
-- set PGPASSWORD=1
-- psql -h localhost -p 5432 -U postgres -d capstonemusic -f "C:\FSU\10 Fall 2025\CEN 4090L\DB\music.sql"

CREATE SCHEMA IF NOT EXISTS music
    AUTHORIZATION postgres;

DROP TABLE IF EXISTS music.user_rating;
DROP TABLE IF EXISTS music.want_to_listen;
DROP TABLE IF EXISTS music.app_user;
DROP TABLE IF EXISTS music.song;
DROP TABLE IF EXISTS music.album;
DROP TABLE IF EXISTS music.genre;
DROP TABLE IF EXISTS music.author;



CREATE TABLE IF NOT EXISTS music.author
(
    author_id integer NOT NULL,
    author_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT author_pkey PRIMARY KEY (author_id)
);

CREATE TABLE IF NOT EXISTS music.genre
(
    genre_id integer NOT NULL,
    genre_name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT genre_pkey PRIMARY KEY (genre_id)
);


CREATE TABLE IF NOT EXISTS music.album
(
    album_id integer NOT NULL,
	author_id integer NOT NULL,
    genre_id integer NOT NULL,
    album_name text COLLATE pg_catalog."default" NOT NULL,
    album_rating real,
    CONSTRAINT album_pkey PRIMARY KEY (album_id)
);
ALTER TABLE music.album ADD CONSTRAINT fk_album_author_id FOREIGN KEY (author_id) REFERENCES music.author (author_id);
ALTER TABLE music.album ADD CONSTRAINT fk_album_genre_id FOREIGN KEY (genre_id) REFERENCES music.genre (genre_id);



CREATE TABLE IF NOT EXISTS music.song
(
	song_id integer NOT NULL,
    author_id integer NOT NULL,
    album_id integer NOT NULL,
    song_name text COLLATE pg_catalog."default" NOT NULL,
    song_num integer NOT NULL,
    CONSTRAINT song_pkey PRIMARY KEY (song_id)
);
ALTER TABLE music.song ADD CONSTRAINT fk_song_author_id FOREIGN KEY (author_id) REFERENCES music.author (author_id);
ALTER TABLE music.song ADD CONSTRAINT fk_song_album_id FOREIGN KEY (album_id) REFERENCES music.album (album_id);


CREATE TABLE IF NOT EXISTS music.app_user
(
    user_id integer NOT NULL,
    user_name text COLLATE pg_catalog."default" NOT NULL,
    user_password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT user_pkey PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS music.user_rating
(
    user_rating real,
    user_id integer NOT NULL,
    album_id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS music.want_to_listen
(
    user_id integer NOT NULL,
    album_id integer NOT NULL
);

ALTER TABLE IF EXISTS music.user_rating
    ADD CONSTRAINT fk_album_id FOREIGN KEY (album_id)
    REFERENCES music.album (album_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS music.user_rating
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id)
    REFERENCES music.app_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS music.want_to_listen
    ADD CONSTRAINT fk_album_id FOREIGN KEY (album_id)
    REFERENCES music.album (album_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS music.want_to_listen
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id)
    REFERENCES music.app_user (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

