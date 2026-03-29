import {
  MutationCache,
  QueryCache,
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

const errorHandler = (err: unknown) => console.error("Query Error:", err);

function makeQueryClient() {
  const queryCache = new QueryCache({
    onError: (err) => {
      errorHandler(err);
    },
  });

  const mutationCache = new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.options.meta?.invalidate ?? true) {
        void queryClient.invalidateQueries({
          queryKey: mutation.options.mutationKey,
        });
      }
    },
    onError: (err, _var, _ctx, _mutation) => {
      errorHandler(err);
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {},
      queries: {
        refetchInterval: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
    queryCache,
    mutationCache,
  });
  return queryClient;
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
