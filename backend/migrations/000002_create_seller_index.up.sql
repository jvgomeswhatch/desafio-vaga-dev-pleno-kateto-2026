CREATE TABLE IF NOT EXISTS seller_index (
    id            INTEGER PRIMARY KEY DEFAULT 1,
    current_index INTEGER NOT NULL    DEFAULT 0,
    CONSTRAINT single_row CHECK (id = 1)
);

CREATE INDEX IF NOT EXISTS idx_seller_index_id ON seller_index (id);

INSERT INTO seller_index (id, current_index)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
