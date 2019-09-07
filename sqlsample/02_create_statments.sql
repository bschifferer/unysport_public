CREATE TABLE university(
    uniid SERIAL,
    name text NOT NULL,
    email_postfix text UNIQUE NOT NULL,
    PRIMARY KEY(uniid),
    CHECK (email_postfix LIKE '@%.%') 
);

CREATE TABLE sport(
    name text,
    PRIMARY KEY(name)
);
CREATE TABLE degree_level(
    name text,
    PRIMARY KEY(name)
);
CREATE TABLE skill_level(
    name text,
    PRIMARY KEY(name)
);
CREATE TABLE gender(
    name text,
    PRIMARY KEY(name)
);
CREATE TABLE location(
    lid SERIAL,
    name text NOT NULL,
    address text NOT NULL,
    opening_hours text,
    PRIMARY KEY(lid)
);
CREATE TABLE users(
    userid SERIAL,
    first_name text NOT NULL,
    last_name text,
    birth_date date,
    email text UNIQUE NOT NULL,
    image_url text,
    uniid int NOT NULL,
    PRIMARY KEY (userid),
    FOREIGN KEY (uniid) REFERENCES university(uniid),
    CHECK (email LIKE '%@%.%')
);
CREATE TABLE groups(
    gid SERIAL,
    name text UNIQUE NOT NULL,
    description text,
    capacity int,
    image_url text,
    created_user_id int NOT NULL,
    sport text NOT NULL,
    PRIMARY KEY (gid),
    FOREIGN KEY (created_user_id) REFERENCES users(userid),
    FOREIGN KEY (sport) REFERENCES sport(name),
    CHECK (capacity>0)
);

CREATE TABLE groups_degree_level(
    gid int NOT NULL,
    degree_level text NOT NULL,
    PRIMARY KEY (gid, degree_level),
    FOREIGN KEY (degree_level) REFERENCES degree_level(name),
    FOREIGN KEY (gid) REFERENCES groups(gid) ON DELETE CASCADE
);

CREATE TABLE groups_skill_level(
    gid int NOT NULL,
    skill_level text NOT NULL,
    PRIMARY KEY (gid, skill_level),
    FOREIGN KEY (skill_level) REFERENCES skill_level(name),
    FOREIGN KEY (gid) REFERENCES groups(gid) ON DELETE CASCADE
);

CREATE TABLE groups_gender(
    gid int NOT NULL,
    gender text NOT NULL,
    PRIMARY KEY (gid, gender),
    FOREIGN KEY (gender) REFERENCES gender(name),
    FOREIGN KEY (gid) REFERENCES groups(gid) ON DELETE CASCADE
);

CREATE TABLE users_join_groups(
    -- at least 1 relationship cannot be enforced in the database and requires application level implementation
    -- adding the creator automatically to the group requires application level implementation
    userid int NOT NULL,
    gid int NOT NULL,
    PRIMARY KEY (userid, gid),
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE,
    FOREIGN KEY (gid) REFERENCES groups(gid) ON DELETE CASCADE
);

CREATE TABLE message(
    mid SERIAL,
    userid int NOT NULL,
    gid int NOT NULL,
    message varchar NOT NULL,
    created_at timestamp DEFAULT current_timestamp,
    PRIMARY KEY (userid, gid, mid),
    FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE CASCADE,
    FOREIGN KEY (gid) REFERENCES groups(gid) ON DELETE CASCADE
);

CREATE TABLE events(
    -- that user can only create events for groups, which they are part of, requires application level implementation    
    eid SERIAL,
    name text NOT NULL,
    recurrency text,
    time text,
    lid int NOT NULL,
    userid int NOT NULL,
    gid int NOT NULL,
    PRIMARY KEY (eid, userid, gid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (lid) REFERENCES location(lid),
    FOREIGN KEY (gid) REFERENCES groups(gid) ON DELETE CASCADE
);
