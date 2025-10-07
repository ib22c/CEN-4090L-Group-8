CREATE SCHEMA IF NOT EXISTS login
    AUTHORIZATION postgres;

DROP TABLE IF EXISTS login.username CASCADE;
DROP TABLE IF EXISTS login.password CASCADE;

-- username table
CREATE TABLE IF NOT EXISTS login.username
(
    user_id SERIAL PRIMARY KEY, -- auto-increments; used for linking the username and passwords
    username TEXT COLLATE pg_catalog."default" NOT NULL UNIQUE -- unique so no shared usernames
);

-- password table
CREATE TABLE IF NOT EXISTS login.password
(
    user_id INTEGER PRIMARY KEY,
    pswd TEXT COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT fk_password_user_id FOREIGN KEY (user_id)
    REFERENCES login.username (user_id)
    ON DELETE CASCADE -- deleting a user will also delete their corresponding pswd
);
