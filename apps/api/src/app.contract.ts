import { oc } from "@orpc/contract";
import { z } from "zod";
import { listingsContract } from "./app/listings/listings.contract.js";
import { chatContract } from "./app/chat/chat.contract.js";

// This is an example representation of using oRPC for Contract-First development
// Typically, we'll define a contract for each controller `*.contract.ts`
// Then, we aggregate all route contracts into `app.contract.ts` to form the router.

const inputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

const outputSchema = z.object({
  fullName: z.string(),
});

const exampleRoute = oc
  .route({ method: "GET", path: "/" })
  .input(inputSchema)
  .output(outputSchema);

export const router = {
  api: exampleRoute,
  listings: listingsContract,
  chat: chatContract,
};
