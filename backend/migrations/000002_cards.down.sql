-- 000002_cards.down.sql
DROP TRIGGER IF EXISTS cards_set_updated_at ON cards;
DROP FUNCTION IF EXISTS set_updated_at();
DROP TABLE IF EXISTS cards;