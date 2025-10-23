import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ChakraProvider } from "@chakra-ui/react";
import { RouterProvider } from "react-router-dom";
import { router } from "@dao/routes";
import { DefaultTheme, TermsConditionModal, ToastContainer } from "@shared/ui-kit";

const SEVEN_SECONDS = 7 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * All React Queries will reference cached data for 7 seconds before
       * refetching the latest set of data (unless `staleTime` is overridden in a specific query).
       * Note that refreshing the page or refocusing a browser tab that contains the application
       * will always cause a refetch. This is a temporary default to reduce the volume of
       * calls we make to the hashio JSON RPC service.
       *
       * @see {@link file://./../../architecture/05_Event_Based_Historical_Queries.md} for more details
       * regarding a long term solution to reduce our hashio JSON RPC service hbar usage.
       */
      staleTime: SEVEN_SECONDS,
      retry: 3,
    },
  },
});

export function DAO() {
  return (
    <ChakraProvider theme={DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <TermsConditionModal />
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
