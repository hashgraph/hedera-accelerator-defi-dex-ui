import { Flex } from "@chakra-ui/react";
import { AppLayout, NotFound } from "@dex/layouts";
import * as Pages from "@dex/pages";
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { Paths } from "@dex/routes";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={Paths.Home} element={<AppLayout navOptions={["Swap", "Pools"]} />}>
      <Route index element={<Navigate to="swap" />} />
      <Route path={Paths.Swap.default} element={<Pages.SwapPage />} />
      <Route path={Paths.Pools.default} element={<Pages.Pools />} />
      <Route path={`${Paths.Pools.AddLiquidity}/:pairId/:poolName`} element={<Pages.AddLiquidityPage />} />
      <Route path={Paths.Pools.Withdraw} element={<Pages.WithdrawPage />} />
      <Route path={Paths.Pools.CreatePool} element={<Pages.CreatePoolPage />} />
      {/* Governance is Deprecated.
      <Route path={Paths.Governance.default}>
        <Route index element={<Pages.Governance />} />
        <Route path={`${Paths.Governance.ProposalDetails}/:id`} element={<Pages.ProposalDetails />} />
        <Route path={Paths.Governance.CreateNewProposal}>
          <Route index element={<Pages.CreateNewProposal />} />
          <Route path={Paths.Governance.CreateNewToken} element={<Pages.CreateTokenProposalForm />} />
          <Route path={Paths.Governance.CreateText} element={<Pages.TextProposalForm />} />
          <Route path={Paths.Governance.CreateTokenTransfer} element={<Pages.TokenTransferProposalForm />} />
          <Route path={Paths.Governance.CreateContractUpgrade} element={<Pages.ContractUpgradeProposalForm />} />
        </Route>
      </Route> 
      */}
      <Route
        path="*"
        element={
          <Flex width="100%" height="70vh" justifyContent="center" alignItems="center">
            <NotFound message={`Page not found.`} />
          </Flex>
        }
      />
    </Route>
  )
);
