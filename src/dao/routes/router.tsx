import { Flex } from "@chakra-ui/react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import { AppLayout, NotFound } from "@dex/layouts";
import { Routes } from "./routes";
import * as Pages from "@dao/pages";
import { DEFAULT_DAO_OVERVIEW_PATH } from "@dao/config/singleDao";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={Routes.Home} element={<AppLayout navOptions={[]} hideFooter brandText="HuffyDAO" />}>
      <Route index element={<Navigate to={DEFAULT_DAO_OVERVIEW_PATH} />} />
      {
        <Route path={Routes.CreateDAOProposal} element={<Pages.CreateDAOProposal />}>
          <Route index element={<Navigate to={Routes.DAOProposalType} replace />} />
          <Route path={Routes.DAOProposalType} element={<Pages.DAOProposalTypeForm />} />
          <Route path={Routes.DAOHuffyDetails} element={<Pages.DAOHuffyDetailsForm />} />
          <Route path={Routes.DAOHuffyRiskParamsDetails} element={<Pages.DAOHuffyRiskParamsDetailsForm />} />
          <Route path={Routes.DAOHuffyAddTradingPairDetails} element={<Pages.DAOHuffyAddTradingPairForm />} />
          <Route path={Routes.DAOHuffyRemoveTradingPairDetails} element={<Pages.DAOHuffyRemoveTradingPairForm />} />
          <Route path={Routes.DAOHuffyRiskParamsReview} element={<Pages.DAOHuffyRiskParamsReviewForm />} />
          <Route path={Routes.DAOHuffyTradingPairReview} element={<Pages.DAOHuffyTraidingPairReviewForm />} />
        </Route>
      }
      {<Route path={`${Routes.Proposals}/:transactionHash`} element={<Pages.GovernanceProposalDetailsPage />} />}
      {
        <Route element={<Pages.GovernanceDAODashboard />}>
          <Route index element={<Navigate to={Routes.Overview} />} />
          <Route path={Routes.Overview} element={<Pages.GovernanceDAODashboardOverview />} />
          <Route path={Routes.Proposals} element={<Pages.GovernanceDAOProposalList />} />
          <Route path={Routes.Assets} element={<Pages.AssetsList />} />
          <Route path={Routes.Staking} element={<NotFound message={`The staking page is under construction`} />} />
          <Route path={Routes.Members} element={<Pages.MembersList />} />
          <Route path={Routes.Settings} element={<Pages.DAOSettings />} />
        </Route>
      }
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
