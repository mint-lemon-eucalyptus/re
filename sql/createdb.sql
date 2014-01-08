CREATE DATABASE testing;


DROP ROLE IF EXISTS auth_client;
CREATE ROLE auth_client;

DROP COLLATION IF EXISTS russian CASCADE;


CREATE COLLATION russian  ( LC_COLLATE = 'ru_RU.utf8', LC_CTYPE = 'ru_RU.utf8');
ALTER COLLATION russian
OWNER TO auth_user;

GRANT CREATE ON
DATABASE testing

TO auth_client;


-- Table: users

-- DROP TABLE users;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users
(
  id      SERIAL                   NOT NULL,
  dt      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name    CHARACTER VARYING(64) COLLATE public.russian,
  email   CHARACTER VARYING(50),
  pass    CHARACTER VARYING(35),
  confirm CHARACTER VARYING(32),
  role    CHARACTER VARYING(10),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

--here are placed all versions of help topics
CREATE TABLE helps
(
  id        SERIAL                   NOT NULL,
  dtcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author    INTEGER REFERENCES users (id),
  name      TEXT COLLATE public.russian,
  version   TEXT,
  content   TEXT,
  CONSTRAINT helps_pkey PRIMARY KEY (id)
);


GRANT USAGE ON SEQUENCE
helps_id_seq
TO auth_client;

-- Index: users_dtm

-- DROP INDEX users_dtm;

-- Index: users_pass_ci

-- DROP INDEX users_pass_ci;

CREATE INDEX users_pass_ci
ON users
USING BTREE
(lower(name :: TEXT) COLLATE public.russian varchar_pattern_ops);

-- Index: users_email

-- DROP INDEX users_email;

CREATE UNIQUE INDEX users_email
ON users
USING BTREE
(email COLLATE pg_catalog."default");


GRANT SELECT, UPDATE, INSERT, DELETE ON
users, helps

TO auth_client;


GRANT USAGE ON SEQUENCE
users_id_seq
TO auth_client;


DROP USER IF EXISTS auth_user;
CREATE USER auth_user WITH PASSWORD '12';


GRANT auth_client TO auth_user;

GRANT SELECT, UPDATE, INSERT ON
users

TO auth_user;


--auth by email and pass
DROP FUNCTION IF EXISTS auth_user( VARCHAR, VARCHAR ) CASCADE;
CREATE FUNCTION auth_user(_email VARCHAR, _pass VARCHAR)
  RETURNS SETOF users LANGUAGE PLPGSQL AS $$
BEGIN
  RETURN QUERY SELECT
                 *
               FROM USERS
               WHERE email = _email AND pass = _pass;
END
$$;


--register new user
DROP FUNCTION IF EXISTS reg_user( VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR ) CASCADE;
CREATE FUNCTION reg_user( _name VARCHAR,_email VARCHAR, _pass VARCHAR, _confirm VARCHAR, _role VARCHAR)
  RETURNS TABLE (id INT) LANGUAGE PLPGSQL AS $$
DECLARE
  userid INTEGER;
BEGIN
  return query INSERT INTO users (email, name, pass, confirm, role) VALUES (_email, _name, _pass,_confirm, _role)
RETURNING users.id;
END
$$;
