-- Custom SQL migration file, put your code below! --
-- Seed test users for production (idempotent)
-- Run: psql $DATABASE_URL -f migration.sql

-- Create test users
INSERT INTO "user" (id, name, email, "emailVerified", image, "isAnonymous", "isBot", "createdAt", "updatedAt")
VALUES
  ('test-user-1', 'Alice Johnson', 'alice@example.com', true, NULL, false, false, NOW(), NOW()),
  ('test-user-2', 'Bob Smith', 'bob@example.com', true, NULL, false, false, NOW(), NOW()),
  ('test-user-3', 'Charlie Brown', 'charlie@example.com', true, NULL, false, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create copilot user
INSERT INTO "user" (id, name, email, "emailVerified", image, "isAnonymous", "isBot", "createdAt", "updatedAt")
VALUES ('copilot', 'Copilot', 'copilot@converge.local', true, NULL, false, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create associated accounts for test users
INSERT INTO "account" (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt")
VALUES
  ('acc-alice-1', 'acct-alice-1', 'credential', 'test-user-1', NULL, NULL, NULL, NULL, NULL, NULL, 'password123', NOW(), NOW()),
  ('acc-bob-1', 'acct-bob-1', 'credential', 'test-user-2', NULL, NULL, NULL, NULL, NULL, NULL, 'password123', NOW(), NOW()),
  ('acc-charlie-1', 'acct-charlie-1', 'credential', 'test-user-3', NULL, NULL, NULL, NULL, NULL, NULL, 'password123', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
