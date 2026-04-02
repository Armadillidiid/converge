-- Repair invalid plaintext credential hashes for seeded users.
-- Better Auth expects account.password to be `salt:key` scrypt hash.

UPDATE "account"
SET
  "password" = CASE "account_id"
    WHEN 'acct-alice-1' THEN '55c760dc1158e495b70207f9f8b0f4da:53645d8d08c147683cf01e6dcd56f3e03d58b4359647f3068271bf7bfc2db446d242a68a03331b4364ecf506404b6288e0b8b43919d5683c5b433795660c6ca4'
    WHEN 'acct-bob-1' THEN 'dcb1857f46cecb944ca49272e51216fe:a9a90a4cf49242e12177a1353c2788dcaf118728501ffa6003580a86cc0dae8f3bf55a74425f9a08b3dfcddce264affb3937652269008805eae2c5b9bfd9656c'
    WHEN 'acct-charlie-1' THEN 'ac954682664cf60e8e35b444b1c13b98:818a3a4b49c5cc4d769f07b132e74cb248ad8a7702e3bd26324db46c9c18dfe74a804342715c93f0f797b35600e870bb11efe0c3d6340b5e28cd42e44f906082'
    ELSE "password"
  END,
  "updated_at" = NOW()
WHERE
  "provider_id" = 'credential'
  AND "account_id" IN ('acct-alice-1', 'acct-bob-1', 'acct-charlie-1')
  AND (
    "password" = 'password123'
    OR "password" IS NULL
    OR POSITION(':' IN "password") = 0
  );
