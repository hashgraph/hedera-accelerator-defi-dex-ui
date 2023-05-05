import { Flex } from "@chakra-ui/react";
import { AppLayout, NotFound } from "@layouts";
import {
  SwapPage,
  Pools,
  AddLiquidityPage,
  WithdrawPage,
  CreatePoolPage,
  Governance,
  ProposalDetails,
  SelectProposalType,
  CreateProposal,
  CreateADAOPage,
  DAOsListPage,
  DashboardOverview,
  TransactionsList,
  AssetsList,
  MembersList,
  MultiSigDAODashboard,
  GovernanceDAODashboard,
  NFTDAODashboard,
} from "@pages";
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { Paths } from "@routes";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={Paths.Home} element={<AppLayout />}>
      <Route index element={<Navigate to="swap" />} />
      {/* TODO: Create Swap/Pool route heirarchy. */}
      <Route path={Paths.Swap.default} element={<SwapPage />} />
      <Route path={Paths.Pools.default} element={<Pools />} />
      <Route path={`${Paths.Pools.AddLiquidity}/:pairId/:poolName`} element={<AddLiquidityPage />} />
      <Route path={Paths.Pools.Withdraw} element={<WithdrawPage />} />
      <Route path={Paths.Pools.CreatePool} element={<CreatePoolPage />} />
      {/* TODO: Create governance route heirarchy. */}
      <Route path={Paths.Governance.default} element={<Governance />} />
      <Route path={`${Paths.Governance.ProposalDetails}/:id`} element={<ProposalDetails />} />
      <Route path={Paths.Governance.SelectProposalType} element={<SelectProposalType />} />
      <Route path={Paths.Governance.CreateNewToken} element={<CreateProposal proposalType="new-token" />} />
      <Route path={Paths.Governance.CreateText} element={<CreateProposal proposalType="text" />} />
      <Route path={Paths.Governance.CreateTokenTransfer} element={<CreateProposal proposalType="token-transfer" />} />
      <Route
        path={Paths.Governance.CreateContractUpgrade}
        element={<CreateProposal proposalType="contract-upgrade" />}
      />
      {/* TODO: Create DAO route heirarchy. */}
      <Route path={Paths.DAOs.default}>
        <Route index element={<DAOsListPage />} />
        <Route path={Paths.DAOs.Create} element={<CreateADAOPage />} />
        <Route path={"multisig/:accountId"} element={<MultiSigDAODashboard />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path={"dashboard"} element={<DashboardOverview />} />
          <Route path={"transactions"} element={<TransactionsList />}>
            {/* TODO: <Route path={":transactionHash"} element={<TransactionDetails />} /> */}
          </Route>
          <Route path={"assets"} element={<AssetsList />} />
          <Route path={"members"} element={<MembersList />} />
          <Route path={"settings"} element={<>Settings</>} />
        </Route>
        <Route path={"governance-token/:accountId"} element={<GovernanceDAODashboard />} />
        <Route path={"nft/:accountId"} element={<NFTDAODashboard />} />
      </Route>
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
