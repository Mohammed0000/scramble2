--
-- Database to keep track of settings:
-- * Keybase username
-- * IMAP account connection parameters
--

create table if not exists IMAPAccount (
  emailAddress text primary key,
  type text not null,
  username text,
  password text,
  host text,
  port integer
);

create table if not exists Setting (
  name text primary key,
  value text not null
);

