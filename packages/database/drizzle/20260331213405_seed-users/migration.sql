-- Custom SQL migration file, put your code below! --
-- Seed users for production (idempotent)

-- Main issue fixed here:
-- conflict must be handled on email too (email is unique), not only id.
INSERT INTO "user" (id, name, email, "email_verified", image, "is_anonymous", "is_bot", "created_at", "updated_at")
VALUES
  ('test-user-1', 'Alice Johnson', 'alice@example.com', true, NULL, false, false, NOW(), NOW()),
  ('test-user-2', 'Bob Smith', 'bob@example.com', true, NULL, false, false, NOW(), NOW()),
  ('test-user-3', 'Charlie Brown', 'charlie@example.com', true, NULL, false, false, NOW(), NOW()),
  ('copilot', 'Copilot', 'copilot@converge.local', true, NULL, false, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create accounts by resolving user_id from email.
INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at")
SELECT 'acc-alice-1', 'acct-alice-1', 'credential', u.id, NULL, NULL, NULL, NULL, NULL, NULL, 'password123', NOW(), NOW()
FROM "user" u
WHERE u.email = 'alice@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at")
SELECT 'acc-bob-1', 'acct-bob-1', 'credential', u.id, NULL, NULL, NULL, NULL, NULL, NULL, 'password123', NOW(), NOW()
FROM "user" u
WHERE u.email = 'bob@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at")
SELECT 'acc-charlie-1', 'acct-charlie-1', 'credential', u.id, NULL, NULL, NULL, NULL, NULL, NULL, 'password123', NOW(), NOW()
FROM "user" u
WHERE u.email = 'charlie@example.com'
ON CONFLICT (id) DO NOTHING;
