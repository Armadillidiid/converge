-- Custom SQL migration file, put your code below! --
-- Seed test users for production (idempotent)
-- Run: psql $DATABASE_URL -f migration.sql

-- Upsert users by unique email so pre-existing rows with different IDs do not fail migration.
WITH seed_users AS (
  SELECT *
  FROM (
    VALUES
      ('test-user-1', 'Alice Johnson', 'alice@example.com', false, false),
      ('test-user-2', 'Bob Smith', 'bob@example.com', false, false),
      ('test-user-3', 'Charlie Brown', 'charlie@example.com', false, false),
      ('copilot', 'Copilot', 'copilot@converge.local', false, true)
  ) AS v(id, name, email, is_anonymous, is_bot)
),
upserted_users AS (
  INSERT INTO "user" (id, name, email, "email_verified", image, "is_anonymous", "is_bot", "created_at", "updated_at")
  SELECT
    su.id,
    su.name,
    su.email,
    true,
    NULL,
    su.is_anonymous,
    su.is_bot,
    NOW(),
    NOW()
  FROM seed_users su
  ON CONFLICT (email) DO UPDATE
  SET
    name = EXCLUDED.name,
    "email_verified" = EXCLUDED."email_verified",
    "is_anonymous" = EXCLUDED."is_anonymous",
    "is_bot" = EXCLUDED."is_bot",
    "updated_at" = NOW()
  RETURNING id, email
),
resolved_users AS (
  SELECT id, email FROM upserted_users
  UNION
  SELECT u.id, u.email
  FROM "user" u
  JOIN seed_users su ON su.email = u.email
)
INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at")
SELECT
  a.id,
  a.account_id,
  'credential',
  ru.id,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'password123',
  NOW(),
  NOW()
FROM (
  VALUES
    ('acc-alice-1', 'acct-alice-1', 'alice@example.com'),
    ('acc-bob-1', 'acct-bob-1', 'bob@example.com'),
    ('acc-charlie-1', 'acct-charlie-1', 'charlie@example.com')
) AS a(id, account_id, email)
JOIN resolved_users ru ON ru.email = a.email
ON CONFLICT (id) DO NOTHING;
