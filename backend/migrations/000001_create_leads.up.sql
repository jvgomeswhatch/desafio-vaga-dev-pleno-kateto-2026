CREATE TABLE IF NOT EXISTS leads (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    desired_skin TEXT       NOT NULL,
    seller_name TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'sem_contato'
                            CHECK (status IN ('sem_contato', 'em_contato', 'perdido', 'finalizado')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
