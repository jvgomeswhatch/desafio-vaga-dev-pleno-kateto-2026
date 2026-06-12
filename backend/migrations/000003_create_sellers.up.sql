CREATE TABLE IF NOT EXISTS sellers (
    id         SERIAL      PRIMARY KEY,
    name       TEXT        NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sellers (name) VALUES
    ('Marcelo'), ('Rafael'), ('Renato'), ('Pedro'), ('Leonardo')
ON CONFLICT DO NOTHING;
