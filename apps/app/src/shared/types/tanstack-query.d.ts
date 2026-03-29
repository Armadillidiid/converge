import "@tanstack/react-query";

interface CustomMeta extends Record<string, unknown> {
  invalidate?: boolean;
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: CustomMeta;
    mutationMeta: CustomMeta;
  }
}
