import "dotenv/config";
import { keys } from "./keys";
import { account, session, user, verification } from "./schemas/better-auth";
import {
  listing,
  listingStatusEnum,
  listingTypeEnum,
  propertyTypeEnum,
} from "./schemas/listings";
import { createDrizzle } from "./index";

async function main() {
  const config = keys();

  if (config.DB_DRIVER !== "postgres") {
    throw new Error("Seed script currently supports DB_DRIVER=postgres only");
  }

  const db = await createDrizzle(keys());

  console.log("Resetting database...");
  await db.execute(
    'TRUNCATE TABLE account, session, verification, listing, "user" RESTART IDENTITY CASCADE;',
  );

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
    };
  });

  console.log("Seeding users...");
  await db.insert(user).values(users);

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

  console.log("Seeding listings...");
  const propertyTypes = propertyTypeEnum.enumValues;
  const listingTypes = listingTypeEnum.enumValues;
  const listingStatuses = listingStatusEnum.enumValues;

  await db.insert(listing).values(
    Array.from({ length: 15 }, (_, index) => ({
      id: `listing-${index + 1}`,
      title: `Sample Listing ${index + 1}`,
      description: `Demo listing description ${index + 1}`,
      price: `${(index + 1) * 1000000}`,
      city: "Lagos",
      state: "Lagos",
      propertyType: propertyTypes[index % propertyTypes.length],
      listingType: listingTypes[index % listingTypes.length],
      bedrooms: index % 4 === 0 ? null : (index % 5) + 1,
      bathrooms: index % 3 === 0 ? null : (index % 4) + 1,
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      ],
      status: listingStatuses[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: users[index % users.length]?.id ?? null,
    })),
  );

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
