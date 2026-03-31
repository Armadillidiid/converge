import "dotenv/config";
import { keys } from "./keys";
import { account, session, user, verification } from "./schemas/better-auth";
import { createDrizzle } from "./index";
import {
  COPILOT_USER_ID,
  COPILOT_USER_EMAIL,
  COPILOT_USER_NAME,
} from "./constants";

async function main() {
  const config = keys();

  if (config.DB_DRIVER !== "postgres") {
    throw new Error("Seed script currently supports DB_DRIVER=postgres only");
  }

  const db = await createDrizzle(keys());

  const users = Array.from({ length: 20 }, (_, index) => {
    const id = `user-${index + 1}`;
    return {
      id,
      name: `Test User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      emailVerified: index % 3 !== 0,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAnonymous: false,
      isBot: false,
    };
  });

  console.log("Seeding users...");
  await db.insert(user).values(users);

  console.log("Seeding copilot user...");
  await db
    .insert(user)
    .values({
      id: COPILOT_USER_ID,
      name: COPILOT_USER_NAME,
      email: COPILOT_USER_EMAIL,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAnonymous: false,
      isBot: true,
    })
    .onConflictDoNothing();

  console.log("Seeding sessions...");
  await db.insert(session).values(
    users.slice(0, 10).map((item, index) => ({
      id: `session-${index + 1}`,
      userId: item.id,
      token: `token-${index + 1}`,
      ipAddress: null,
      userAgent: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  console.log("Seeding accounts...");
  await db.insert(account).values(
    users.map((item, index) => ({
      id: `account-${index + 1}`,
      accountId: `acct-${index + 1}`,
      providerId: index % 2 === 0 ? "credential" : "google",
      userId: item.id,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  console.log("Seeding verifications...");
  await db.insert(verification).values(
    users.slice(0, 5).map((item, index) => ({
      id: `verification-${index + 1}`,
      identifier: item.email,
      value: `verify-token-${index + 1}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  // TODO: Seed chat rooms, messages, etc.

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
