-- 000002_cards.up.sql
-- Invitations (called "cards" to match the existing Supabase schema).
-- Mirrors the live Supabase project so the local DB and prod are aligned.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  template_slug text NOT NULL,
  title         text NOT NULL DEFAULT 'Untitled',
  slug          text NOT NULL UNIQUE,
  status        text NOT NULL DEFAULT 'draft',
  layout_type   text,
  theme         jsonb,
  access_type   text NOT NULL DEFAULT 'public',
  access_secret text,
  sections      jsonb NOT NULL DEFAULT '{}'::jsonb,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cards_user_id_idx   ON cards (user_id);
CREATE INDEX IF NOT EXISTS cards_template_idx  ON cards (template_slug);
CREATE INDEX IF NOT EXISTS cards_status_idx    ON cards (status);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cards_set_updated_at ON cards;
CREATE TRIGGER cards_set_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();