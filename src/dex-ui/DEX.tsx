import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { ChakraProvider, Container, Flex } from "@chakra-ui/react";
import {
  SwapPage,
  AddLiquidityPage,
  WithdrawPage,
  Pools,
  Governance,
  ProposalDetails,
  CreateProposal,
  SelectProposalType,
  CreatePoolPage,
  DAOsListPage,
  CreateADAOPage,
  DAODetailsPage,
  MemberUpdate,
} from "@pages";
import { TopMenuBar } from "@layouts";
import { Color } from "@dex-ui-components";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useWalletConnection } from "@hooks";
import { ScrollToTop } from "@utils";
import { DEXTheme } from "@theme";
import { Paths } from "@routes";

const menuOptions = ["Swap", "Pools", "Governance", "DAOs"];
const SEVEN_SECONDS = 7 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * All React Queries will reference cached data for 7 seconds before
       * refetching the latest set of data (unless `staleTime` is overridden in a specific query).
       * Note that refreshing the page or refocusing the browser tab that contains the application
       * will always cause a refetch. This is a temporary default to reduce the volume of
       * calls we make to the hashio JSON RPC service.
       *
       * @see {@link file://./../../architecture/05_Event_Based_Historical_Queries.md} for more details
       * regarding a long term solution to reduce our hashio JSON RPC service hbar usage.
       */
      staleTime: SEVEN_SECONDS,
    },
  },
});

const DEX = () => {
  useWalletConnection();
  return (
    <ChakraProvider theme={DEXTheme}>
      <QueryClientProvider client={queryClient}>
        <Container color="black" w="100%" maxWidth="100%" height="100vh" bg={Color.White_02} padding="0" margin="0">
          <Router>
            <ScrollToTop>
              <TopMenuBar menuOptions={menuOptions} />
              <Flex width="100%" minHeight="100%" paddingBottom="2rem">
                <Routes>
                  <Route path={Paths.Home} element={<Navigate to="/swap" />} />
                  <Route path={Paths.Swap.default} element={<SwapPage />} />
                  <Route path={Paths.Pools.default} element={<Pools />} />
                  <Route path={`${Paths.Pools.AddLiquidity}/:pairId/:poolName`} element={<AddLiquidityPage />} />
                  <Route path={Paths.Pools.Withdraw} element={<WithdrawPage />} />
                  <Route path={Paths.Pools.CreatePool} element={<CreatePoolPage />} />
                  <Route path={Paths.Governance.default} element={<Governance />} />
                  <Route path={`${Paths.Governance.ProposalDetails}/:id`} element={<ProposalDetails />} />
                  <Route path={Paths.Governance.SelectProposalType} element={<SelectProposalType />} />
                  <Route path={Paths.Governance.CreateNewToken} element={<CreateProposal proposalType="new-token" />} />
                  <Route path={Paths.Governance.CreateText} element={<CreateProposal proposalType="text" />} />
                  <Route
                    path={Paths.Governance.CreateTokenTransfer}
                    element={<CreateProposal proposalType="token-transfer" />}
                  />
                  <Route
                    path={Paths.Governance.CreateContractUpgrade}
                    element={<CreateProposal proposalType="contract-upgrade" />}
                  />
                  <Route path={Paths.DAOs.default} element={<DAOsListPage />} />
                  <Route path={Paths.DAOs.CreateDAO} element={<CreateADAOPage />} />
                  <Route path={`${Paths.DAOs.DAODetails}/:accountId`} element={<DAODetailsPage />} />
                  <Route path={Paths.DAOs.AddNewMember} element={<MemberUpdate operationType="add-member" />} />
                  <Route path={Paths.DAOs.RemoveMember} element={<MemberUpdate operationType="remove-member" />} />
                  <Route path={Paths.DAOs.ReplaceMember} element={<MemberUpdate operationType="replace-member" />} />
                  <Route
                    path={Paths.DAOs.ChangeThreshold}
                    element={<MemberUpdate operationType="change-threshold" />}
                  />
                </Routes>
              </Flex>
            </ScrollToTop>
          </Router>
        </Container>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export { DEX };
