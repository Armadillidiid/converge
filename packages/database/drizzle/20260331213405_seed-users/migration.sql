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
SELECT 'acc-alice-1', 'acct-alice-1', 'credential', u.id, NULL, NULL, NULL, NULL, NULL, NULL, '55c760dc1158e495b70207f9f8b0f4da:53645d8d08c147683cf01e6dcd56f3e03d58b4359647f3068271bf7bfc2db446d242a68a03331b4364ecf506404b6288e0b8b43919d5683c5b433795660c6ca4', NOW(), NOW()
FROM "user" u
WHERE u.email = 'alice@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at")
SELECT 'acc-bob-1', 'acct-bob-1', 'credential', u.id, NULL, NULL, NULL, NULL, NULL, NULL, 'dcb1857f46cecb944ca49272e51216fe:a9a90a4cf49242e12177a1353c2788dcaf118728501ffa6003580a86cc0dae8f3bf55a74425f9a08b3dfcddce264affb3937652269008805eae2c5b9bfd9656c', NOW(), NOW()
FROM "user" u
WHERE u.email = 'bob@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO "account" (id, "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at")
SELECT 'acc-charlie-1', 'acct-charlie-1', 'credential', u.id, NULL, NULL, NULL, NULL, NULL, NULL, 'ac954682664cf60e8e35b444b1c13b98:818a3a4b49c5cc4d769f07b132e74cb248ad8a7702e3bd26324db46c9c18dfe74a804342715c93f0f797b35600e870bb11efe0c3d6340b5e28cd42e44f906082', NOW(), NOW()
FROM "user" u
WHERE u.email = 'charlie@example.com'
ON CONFLICT (id) DO NOTHING;
