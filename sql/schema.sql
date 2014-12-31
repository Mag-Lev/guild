DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS forums CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

CREATE TABLE users (
  id         serial PRIMARY KEY,
  uname      text NOT NULL,
  digest     text NOT NULL,
  email      text NOT NULL,
  created_at timestamp with time zone NOT NULL  DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_username ON users USING btree (lower(uname));

CREATE TABLE sessions (
  id         uuid PRIMARY KEY,
  user_id    int  REFERENCES users(id),
  ip_address inet NOT NULL,
  expired_at timestamp with time zone NOT NULL
                                      DEFAULT NOW() + INTERVAL '15 minutes',
  created_at timestamp with time zone NOT NULL  DEFAULT NOW()
);

CREATE TABLE categories (
  id          serial PRIMARY KEY,
  title       text NOT NULL,
  description text NULL,
  pos         int NOT NULL
);

CREATE TABLE forums (
  id              serial PRIMARY KEY,
  category_id     int NOT NULL  REFERENCES categories(id),
  parent_forum_id int NULL  REFERENCES forums(id),
  title           text NOT NULL,
  description     text NULL,
  pos             int NOT NULL,
  is_roleplay     boolean NOT NULL  DEFAULT false,
  -- Cache
  topics_count    int NOT NULL  DEFAULT 0,
  posts_count     int NOT NULL  DEFAULT 0
);

CREATE TABLE topics (
  id         serial PRIMARY KEY,
  title      text NOT NULL,
  user_id    int NOT NULL  REFERENCES users(id),
  forum_id   int NOT NULL  REFERENCES forums(id),
  created_at timestamp with time zone NOT NULL  DEFAULT NOW(),
  is_hidden  boolean NOT NULL  DEFAULT false,
  is_closed  boolean NOT NULL  DEFAULT false,
  is_sticky  boolean NOT NULL  DEFAULT false,
  -- Cache
  posts_count int NOT NULL  DEFAULT 0
);

CREATE TABLE posts (
  id         serial PRIMARY KEY,
  text       text NOT NULL,
  topic_id   int NOT NULL  REFERENCES topics(id),
  user_id    int NOT NULL  REFERENCES users(id),
  created_at timestamp with time zone NOT NULL  DEFAULT NOW(),
  ip_address inet NULL,
  is_hidden  boolean NOT NULL  DEFAULT false
);

ALTER TABLE forums ADD COLUMN latest_post_id int NULL REFERENCES posts(id);
ALTER TABLE topics ADD COLUMN latest_post_id int NULL REFERENCES posts(id);

------------------------------------------------------------

-- Update forum.topics_count when a topic is inserted/deleted

-- http://www.postgresql.org/docs/9.1/static/sql-start-transaction.html
-- http://www.postgresql.org/docs/8.0/static/plpgsql-trigger.html
-- http://www.postgresql.org/docs/9.1/static/sql-createtrigger.html
CREATE OR REPLACE FUNCTION update_forum_topics_count()
RETURNS trigger AS $update_forum_topics_count$
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            UPDATE forums
            SET topics_count = topics_count - 1
            WHERE id = OLD.forum_id;
        ELSIF (TG_OP = 'INSERT') THEN
            UPDATE forums
            SET topics_count = topics_count + 1
            WHERE id = NEW.forum_id;
        END IF;
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$update_forum_topics_count$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS topic_created ON topics;
CREATE TRIGGER topic_created
    AFTER INSERT OR DELETE ON topics
    FOR EACH ROW
    EXECUTE PROCEDURE update_forum_topics_count();

------------------------------------------------------------
-- Update forum.posts_count when a post is inserted/deleted

CREATE OR REPLACE FUNCTION update_forum_posts_count()
RETURNS trigger AS $update_forum_posts_count$
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            UPDATE forums
            SET posts_count = posts_count - 1
            WHERE id = (
              SELECT forum_id
              FROM topics
              WHERE topics.id = OLD.topic_id
            );
        ELSIF (TG_OP = 'INSERT') THEN
            UPDATE forums
            SET posts_count = posts_count + 1
            WHERE id = (
              SELECT forum_id
              FROM topics
              WHERE topics.id = NEW.topic_id
            );
        END IF;
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$update_forum_posts_count$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_created1 ON posts;
CREATE TRIGGER post_created1
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_forum_posts_count();

------------------------------------------------------------
-- Update topic.posts_count when a post is inserted/deleted

CREATE OR REPLACE FUNCTION update_topic_posts_count()
RETURNS trigger AS $update_topic_posts_count$
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            UPDATE topics
            SET posts_count = posts_count - 1
            WHERE id = OLD.topic_id;
        ELSIF (TG_OP = 'INSERT') THEN
            UPDATE topics
            SET posts_count = posts_count + 1
            WHERE id = NEW.topic_id;
        END IF;
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$update_topic_posts_count$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_created2 ON posts;
CREATE TRIGGER post_created2
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_topic_posts_count();

------------------------------------------------------------
-- Update forum.latest_post_id when a post is inserted/deleted

CREATE OR REPLACE FUNCTION update_forum_latest_post_id()
RETURNS trigger AS $update_forum_latest_post_id$
    BEGIN
        UPDATE forums
        SET latest_post_id = NEW.id
        WHERE id = (
          SELECT forum_id
          FROM topics
          WHERE topics.id = NEW.topic_id
        );
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$update_forum_latest_post_id$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_created3 ON posts;
CREATE TRIGGER post_created3
    AFTER INSERT ON posts  -- Only on insert
    FOR EACH ROW
    EXECUTE PROCEDURE update_forum_latest_post_id();

------------------------------------------------------------

-- Update topic.latest_post_id when a post is inserted/deleted

CREATE OR REPLACE FUNCTION update_topic_latest_post_id()
RETURNS trigger AS $update_topic_latest_post_id$
    BEGIN
        UPDATE topics
        SET latest_post_id = NEW.id
        WHERE id = NEW.topic_id;
        RETURN NULL; -- result is ignored since this is an AFTER trigger
    END;
$update_topic_latest_post_id$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_created4 ON posts;
CREATE TRIGGER post_created4
    AFTER INSERT ON posts  -- Only on insert
    FOR EACH ROW
    EXECUTE PROCEDURE update_topic_latest_post_id();

------------------------------------------------------------
