import { Flex } from "@chakra-ui/react";
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from "react-router-dom";
import { AppLayout, NotFound } from "@dex/layouts";
import { Routes } from "./routes";
import * as Pages from "@dao/pages";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={Routes.Home} element={<AppLayout navOptions={[]} />}>
      <Route index element={<Pages.DAOsListPage />} />
      <Route path={Routes.Create} element={<Pages.CreateADAOPage />}>
        <Route index element={<Navigate to={Routes.DAODisclaimer} />} />
        <Route path={Routes.DAODisclaimer} element={<Pages.DAODisclaimerForm />} />
        <Route path={Routes.DAODetails} element={<Pages.DAODetailsForm />} />
        <Route path={Routes.Type} element={<Pages.DAOTypeForm />} />
        <Route path={Routes.GovernanceToken} element={<Pages.TokenDAOGovernanceForm />} />
        <Route path={Routes.GovernanceTokenVoting} element={<Pages.TokenDAOVotingForm />} />
        <Route path={Routes.GovernanceTokenReview} element={<Pages.TokenDAOReviewForm />} />
        <Route path={Routes.Multisig} element={<Pages.MultiSigDAOGovernanceForm />} />
        <Route path={Routes.MultisigVoting} element={<Pages.MultiSigDAOVotingForm />} />
        <Route path={Routes.MultisigReview} element={<Pages.MultiSigDAOReviewForm />} />
        <Route path={Routes.NFT} element={<Pages.NFTDAOGovernanceForm />} />
        <Route path={Routes.NFTVoting} element={<Pages.NFTDAOVotingForm />} />
        <Route path={Routes.NFTReview} element={<Pages.NFTDAOReviewForm />} />
      </Route>
      <Route path={`${Routes.Multisig}/:accountId`} element={<Pages.MultiSigDAODashboard />}>
        <Route index element={<Navigate to={Routes.Overview} />} />
        <Route path={Routes.Overview} element={<Pages.DashboardOverview />} />
        <Route path={Routes.Proposals} element={<Pages.ProposalList />} />
        <Route path={Routes.Assets} element={<Pages.AssetsList />} />
        <Route path={Routes.Members} element={<Pages.MembersList />} />
        <Route path={Routes.Settings} element={<Pages.Settings />} />
      </Route>
      <Route path={`${Routes.GovernanceToken}/:accountId`} element={<Pages.GovernanceDAODashboard />}>
        <Route index element={<Navigate to={Routes.Overview} />} />
        <Route path={Routes.Overview} element={<Pages.GovernanceDAODashboardOverview />} />
        <Route path={Routes.Proposals} element={<Pages.ProposalList />} />
        <Route path={Routes.Assets} element={<Pages.AssetsList />} />
        <Route path={Routes.Staking} element={<NotFound message={`The staking page is under construction`} />} />
        <Route path={Routes.Members} element={<Pages.MembersList />} />
        <Route path={Routes.Settings} element={<Pages.DAOSettings />} />
      </Route>
      <Route
        path={`${Routes.GovernanceToken}/:accountId/settings/change-dao-details`}
        element={<Pages.UpdateDAODetails />}
      >
        <Route index element={<Navigate to={Routes.DetailsStep} />} />
        <Route path={Routes.DetailsStep} element={<Pages.UpdateDAODetailsForm />} />
        <Route path={Routes.ReviewStep} element={<Pages.UpdateDAODetailsReviewForm />} />
      </Route>
      <Route path={`${Routes.NFT}/:accountId`} element={<Pages.NFTDAODashboard />}>
        <Route index element={<Navigate to={Routes.Overview} />} />
        <Route path={Routes.Overview} element={<Pages.NFTDAODashboardOverview />} />
        <Route path={Routes.Proposals} element={<Pages.ProposalList />} />
        <Route path={Routes.Assets} element={<Pages.AssetsList />} />
        <Route path={Routes.Staking} element={<NotFound message={`The staking page is under construction`} />} />
        <Route path={Routes.Members} element={<Pages.MembersList />} />
        <Route path={Routes.Settings} element={<Pages.DAOSettings />} />
      </Route>
      <Route path={`${Routes.NFT}/:accountId/settings/change-dao-details`} element={<Pages.UpdateDAODetails />}>
        <Route index element={<Navigate to={Routes.DetailsStep} />} />
        <Route path={Routes.DetailsStep} element={<Pages.UpdateDAODetailsForm />} />
        <Route path={Routes.ReviewStep} element={<Pages.UpdateDAODetailsReviewForm />} />
      </Route>
      <Route path={`${Routes.GovernanceToken}/:accountId/new-proposal`} element={<Pages.CreateDAOProposal />}>
        <Route index element={<Navigate to={Routes.DAOProposalType} />} />
        <Route path={Routes.DAOProposalType} element={<Pages.DAOProposalTypeForm />} />
        <Route path={Routes.DAOTokenTransferDetails} element={<Pages.DAOTokenTransferDetailsForm />} />
        <Route path={Routes.DAOTokenTransferReview} element={<Pages.DAOTokenTransferReviewForm />} />
        <Route path={Routes.DAOContractUpgradeDetails} element={<Pages.DAOContractUpgradeDetailsForm />} />
        <Route path={Routes.DAOContractUpgradeReview} element={<Pages.DAOContractUpgradeReviewForm />} />
        <Route path={Routes.DAOTextProposalDetails} element={<Pages.DAOTextProposalDetailsForm />} />
        <Route path={Routes.DAOTextProposalReview} element={<Pages.DAOTextProposalReviewForm />} />
        <Route path={Routes.DAOTokenAssociateDetails} element={<Pages.DAOTokenAssociateDetailsForm />} />
        <Route path={Routes.DAOTokenAssociateReview} element={<Pages.DAOTokenAssociateReviewForm />} />
        <Route path={Routes.DAOGenericProposalDetails} element={<Pages.DAOGenericProposalDetailsForm />} />
        <Route path={Routes.DAOGenericProposalReview} element={<Pages.DAOGenericProposalReviewForm />} />
      </Route>
      <Route path={`${Routes.NFT}/:accountId/new-proposal`} element={<Pages.CreateDAOProposal />}>
        <Route index element={<Navigate to={Routes.DAOProposalType} />} />
        <Route path={Routes.DAOProposalType} element={<Pages.DAOProposalTypeForm />} />
        <Route path={Routes.DAOTokenTransferDetails} element={<Pages.DAOTokenTransferDetailsForm />} />
        <Route path={Routes.DAOTokenTransferReview} element={<Pages.DAOTokenTransferReviewForm />} />
        <Route path={Routes.DAOTextProposalDetails} element={<Pages.DAOTextProposalDetailsForm />} />
        <Route path={Routes.DAOTextProposalReview} element={<Pages.DAOTextProposalReviewForm />} />
        <Route path={Routes.DAOContractUpgradeDetails} element={<Pages.DAOContractUpgradeDetailsForm />} />
        <Route path={Routes.DAOContractUpgradeReview} element={<Pages.DAOContractUpgradeReviewForm />} />
        <Route path={Routes.DAOTokenAssociateDetails} element={<Pages.DAOTokenAssociateDetailsForm />} />
        <Route path={Routes.DAOTokenAssociateReview} element={<Pages.DAOTokenAssociateReviewForm />} />
        <Route path={Routes.DAOGenericProposalDetails} element={<Pages.DAOGenericProposalDetailsForm />} />
        <Route path={Routes.DAOGenericProposalReview} element={<Pages.DAOGenericProposalReviewForm />} />
      </Route>
      <Route path={`${Routes.Multisig}/:accountId/new-proposal`} element={<Pages.CreateDAOProposal />}>
        <Route index element={<Navigate to={Routes.DAOProposalType} />} />
        <Route path={Routes.DAOProposalType} element={<Pages.DAOProposalTypeForm />} />
        <Route path={Routes.DAOTextProposalDetails} element={<Pages.DAOTextProposalDetailsForm />} />
        <Route path={Routes.DAOTextProposalReview} element={<Pages.DAOTextProposalReviewForm />} />
        <Route path={Routes.DAOTokenTransferDetails} element={<Pages.DAOTokenTransferDetailsForm />} />
        <Route path={Routes.DAOTokenTransferReview} element={<Pages.DAOTokenTransferReviewForm />} />
        <Route path={Routes.DAOAddMemberDetails} element={<Pages.DAOAddMemberDetailsForm />} />
        <Route path={Routes.DAOAddMemberReview} element={<Pages.DAOAddMemberReviewForm />} />
        <Route path={Routes.DAODeleteMemberDetails} element={<Pages.DAODeleteMemberDetailsForm />} />
        <Route path={Routes.DAODeleteMemberReview} element={<Pages.DAODeleteMemberReviewForm />} />
        <Route path={Routes.DAOReplaceMemberDetails} element={<Pages.DAOReplaceMemberDetailsForm />} />
        <Route path={Routes.DAOReplaceMemberReview} element={<Pages.DAOReplaceMemberReviewForm />} />
        <Route path={Routes.DAOUpgradeThresholdDetails} element={<Pages.DAOUpgradeThresholdDetailsForm />} />
        <Route path={Routes.DAOUpgradeThresholdReview} element={<Pages.DAOUpgradeThresholdReviewForm />} />
        <Route path={Routes.DAOTokenAssociateDetails} element={<Pages.DAOTokenAssociateDetailsForm />} />
        <Route path={Routes.DAOTokenAssociateReview} element={<Pages.DAOTokenAssociateReviewForm />} />
        <Route path={Routes.DAOContractUpgradeDetails} element={<Pages.DAOContractUpgradeDetailsForm />} />
        <Route path={Routes.DAOContractUpgradeReview} element={<Pages.DAOContractUpgradeReviewForm />} />
        <Route path={Routes.DAOGenericProposalDetails} element={<Pages.DAOGenericProposalDetailsForm />} />
        <Route path={Routes.DAOGenericProposalReview} element={<Pages.DAOGenericProposalReviewForm />} />
      </Route>
      <Route path={`${Routes.Multisig}/:accountId/settings/change-dao-details`} element={<Pages.UpdateDAODetails />}>
        <Route index element={<Navigate to={Routes.DetailsStep} />} />
        <Route path={Routes.DetailsStep} element={<Pages.UpdateDAODetailsForm />} />
        <Route path={Routes.ReviewStep} element={<Pages.UpdateDAODetailsReviewForm />} />
      </Route>
      <Route
        path={`${Routes.Multisig}/:accountId/proposals/:transactionHash`}
        element={<Pages.ProposalDetailsPage />}
      />
      <Route
        path={`${Routes.GovernanceToken}/:accountId/proposals/:proposalId`}
        element={<Pages.GovernanceProposalDetailsPage />}
      />
      <Route
        path={`${Routes.NFT}/:accountId/proposals/:proposalId`}
        element={<Pages.GovernanceProposalDetailsPage />}
      />
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
