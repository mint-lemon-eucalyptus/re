drop COLLATION if exists russian cascade;


CREATE COLLATION russian  (LC_COLLATE='ru_RU.utf8', LC_CTYPE='ru_RU.utf8');
ALTER COLLATION russian  OWNER TO TESTING_USER;

 create database testing;
 create user testing_user with password '12';

grant all privileges on database testing to testing_user;


-- Table: users

-- DROP TABLE users;
drop table if exists users cascade;

CREATE TABLE users
(
  id serial NOT NULL,
  dt timestamp with time zone NOT NULL default now(),
  name character varying(64) COLLATE public.russian,
  email character varying(50),
  pass character varying(35),
  confirm character varying(32),
  CONSTRAINT users_pkey PRIMARY KEY (id )
);

-- Index: users_dtm

-- DROP INDEX users_dtm;

-- Index: users_name_ci

-- DROP INDEX users_name_ci;

CREATE INDEX users_name_ci
  ON users
  USING btree
  (lower(name::text) COLLATE public.russian varchar_pattern_ops);

-- Index: users_token

-- DROP INDEX users_token;

CREATE UNIQUE INDEX users_email
  ON users
  USING btree
  (email COLLATE pg_catalog."default" );



