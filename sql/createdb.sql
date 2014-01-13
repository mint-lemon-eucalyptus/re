CREATE DATABASE testing;


DROP ROLE IF EXISTS auth_client;
CREATE ROLE auth_client;
GRANT CREATE ON DATABASE testing TO auth_client;
DROP USER IF EXISTS auth_user;
CREATE USER auth_user WITH PASSWORD '12';
GRANT auth_client TO auth_user;

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users
(
  id      SERIAL                   NOT NULL,
  dt      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name    CHARACTER VARYING(64),
  email   CHARACTER VARYING(50),
  pass    CHARACTER VARYING(35),
  confirm CHARACTER VARYING(32),
  role    CHARACTER VARYING(10),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
DROP INDEX users_dtm;
DROP INDEX users_email;
CREATE UNIQUE INDEX users_email ON users USING BTREE (email COLLATE pg_catalog."default");
GRANT SELECT, UPDATE, INSERT, DELETE ON users TO auth_client;
GRANT USAGE ON SEQUENCE users_id_seq TO auth_client;

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
CREATE FUNCTION reg_user(_name VARCHAR, _email VARCHAR, _pass VARCHAR, _confirm VARCHAR, _role VARCHAR)
  RETURNS TABLE(id INT) LANGUAGE PLPGSQL AS $$
DECLARE
  userid INTEGER;
BEGIN
  RETURN query INSERT INTO users (email, name, pass, confirm, role) VALUES (_email, _name, _pass, _confirm, _role)
RETURNING users.id;
END
$$;

DROP TABLE help_chapters;
CREATE TABLE help_chapters
(
  id        SERIAL                   NOT NULL,
  dtcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  author    INTEGER,
  name      TEXT,
  content   TEXT,
  pos   INT,
  published   BOOL default false,
  CONSTRAINT help_chapters_pkey PRIMARY KEY (id),
  CONSTRAINT help_chapters_author_fkey FOREIGN KEY (author)
  REFERENCES users (id) MATCH SIMPLE
  ON UPDATE NO ACTION ON DELETE NO ACTION
);
GRANT ALL ON TABLE help_chapters TO auth_client;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE help_chapters TO auth_client;
GRANT USAGE ON SEQUENCE help_chapters_id_seq TO auth_client;
