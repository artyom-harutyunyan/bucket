-- Normalized title + description for SQL search (encrypted fields are not searchable).
ALTER TABLE "items" ADD COLUMN "search_text" TEXT NOT NULL DEFAULT '';

CREATE INDEX "items_search_text_idx" ON "items"("search_text");

-- Backfill plaintext legacy rows.
UPDATE "items"
SET "search_text" = lower(trim(concat(title, ' ', description)))
WHERE "search_text" = ''
  AND title NOT LIKE 'enc:v1:%'
  AND description NOT LIKE 'enc:v1:%';
