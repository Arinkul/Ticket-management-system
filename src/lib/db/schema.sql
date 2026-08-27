-- Offline Ticket Management App - Database Schema
-- Module 1: core tables. Later modules add indexes/views for analytics.

CREATE TABLE IF NOT EXISTS admins (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promoters are created by admin. login_id is what the promoter types in
-- (shown to admin after creation), password is admin-set/reset.
CREATE TABLE IF NOT EXISTS promoters (
    id            SERIAL PRIMARY KEY,
    login_id      VARCHAR(30) UNIQUE NOT NULL,
    name          VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    password_hash TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    venue        VARCHAR(200) NOT NULL,
    -- an event can span multiple sellable dates (promoter picks one at entry time)
    event_dates  DATE[] NOT NULL,
    description  TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_by   INTEGER REFERENCES admins(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Links a promoter to an event with the price/quantity admin assigned them.
CREATE TABLE IF NOT EXISTS promoter_assignments (
    id               SERIAL PRIMARY KEY,
    event_id         INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    promoter_id      INTEGER NOT NULL REFERENCES promoters(id) ON DELETE CASCADE,
    ticket_price     NUMERIC(10,2) NOT NULL,
    ticket_quantity  INTEGER NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, promoter_id)
);

-- Each row = one ticket sale logged by a promoter. Promoters can never delete these.
CREATE TABLE IF NOT EXISTS ticket_entries (
    id               SERIAL PRIMARY KEY,
    event_id         INTEGER NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    promoter_id      INTEGER NOT NULL REFERENCES promoters(id) ON DELETE RESTRICT,
    selected_date    DATE NOT NULL,
    buyer_name       VARCHAR(150) NOT NULL,
    buyer_phone      VARCHAR(20) NOT NULL,
    buyer_email      VARCHAR(150),
    money_received   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_event ON ticket_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_entries_promoter ON ticket_entries(promoter_id);
CREATE INDEX IF NOT EXISTS idx_assignments_event ON promoter_assignments(event_id);
