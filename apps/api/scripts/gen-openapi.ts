import "dotenv/config";
import { genOpenapiDocs } from "#src/lib/openapi.js";

void (async () => {
  const docs = await genOpenapiDocs();
  console.log(JSON.stringify(docs, null, 2));
})();
