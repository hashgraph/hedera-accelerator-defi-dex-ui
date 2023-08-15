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
  CreateNewProposal,
  CreateADAOPage,
  DAOsListPage,
  DashboardOverview,
  ProposalList,
  AssetsList,
  MembersList,
  MultiSigDAODashboard,
  GovernanceDAODashboard,
  NFTDAODashboard,
  Settings,
  TextProposalForm,
  ContractUpgradeProposalForm,
  TokenTransferProposalForm,
  CreateTokenProposalForm,
  GovernanceDAODashboardOverview,
  DAODetailsForm,
  DAOTypeForm,
  TokenDAOGovernanceForm,
  TokenDAOVotingForm,
  TokenDAOReviewForm,
  MultiSigDAOGovernanceForm,
  MultiSigDAOVotingForm,
  MultiSigDAOReviewForm,
  NFTDAOGovernanceForm,
  NFTDAOVotingForm,
  NFTDAOReviewForm,
  NFTDAODashboardOverview,
  DAOSettings,
  ProposalDetailsPage,
  CreateDAOProposal,
  DAOProposalTypeForm,
  DAOTextProposalDetailsForm,
  DAOTextProposalReviewForm,
  DAOTokenTransferDetailsForm,
  DAOTokenTransferReviewForm,
  DAOAddMemberDetailsForm,
  DAOAddMemberReviewForm,
  DAODeleteMemberDetailsForm,
  DAODeleteMemberReviewForm,
  DAOReplaceMemberDetailsForm,
  DAOReplaceMemberReviewForm,
  DAOUpgradeThresholdDetailsForm,
  DAOUpgradeThresholdReviewForm,
  DAOContractUpgradeDetailsForm,
  DAOContractUpgradeReviewForm,
  DAOTokenAssociateDetailsForm,
  DAOTokenAssociateReviewForm,
  GovernanceProposalDetailsPage,
  UpdateDAODetails,
  UpdateDAODetailsForm,
  UpdateDAODetailsReviewForm,
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
      <Route path={Paths.Governance.default}>
        <Route index element={<Governance />} />
        <Route path={`${Paths.Governance.ProposalDetails}/:id`} element={<ProposalDetails />} />
        <Route path={Paths.Governance.CreateNewProposal}>
          <Route index element={<CreateNewProposal />} />
          <Route path={Paths.Governance.CreateNewToken} element={<CreateTokenProposalForm />} />
          <Route path={Paths.Governance.CreateText} element={<TextProposalForm />} />
          <Route path={Paths.Governance.CreateTokenTransfer} element={<TokenTransferProposalForm />} />
          <Route path={Paths.Governance.CreateContractUpgrade} element={<ContractUpgradeProposalForm />} />
        </Route>
      </Route>
      {/* TODO: Create DAO route heirarchy. */}
      <Route path={Paths.DAOs.default}>
        <Route index element={<DAOsListPage />} />
        <Route path={Paths.DAOs.Create} element={<CreateADAOPage />}>
          <Route index element={<Navigate to={Paths.DAOs.DAODetails} />} />
          <Route path={Paths.DAOs.DAODetails} element={<DAODetailsForm />} />
          <Route path={Paths.DAOs.Type} element={<DAOTypeForm />} />
          <Route path={Paths.DAOs.GovernanceToken} element={<TokenDAOGovernanceForm />} />
          <Route path={Paths.DAOs.GovernanceTokenVoting} element={<TokenDAOVotingForm />} />
          <Route path={Paths.DAOs.GovernanceTokenReview} element={<TokenDAOReviewForm />} />
          <Route path={Paths.DAOs.Multisig} element={<MultiSigDAOGovernanceForm />} />
          <Route path={Paths.DAOs.MultisigVoting} element={<MultiSigDAOVotingForm />} />
          <Route path={Paths.DAOs.MultisigReview} element={<MultiSigDAOReviewForm />} />
          <Route path={Paths.DAOs.NFT} element={<NFTDAOGovernanceForm />} />
          <Route path={Paths.DAOs.NFTVoting} element={<NFTDAOVotingForm />} />
          <Route path={Paths.DAOs.NFTReview} element={<NFTDAOReviewForm />} />
        </Route>
        <Route path={`${Paths.DAOs.Multisig}/:accountId`} element={<MultiSigDAODashboard />}>
          <Route index element={<Navigate to={Paths.DAOs.Overview} />} />
          <Route path={Paths.DAOs.Overview} element={<DashboardOverview />} />
          <Route path={Paths.DAOs.Proposals} element={<ProposalList />} />
          <Route path={Paths.DAOs.Assets} element={<AssetsList />} />
          <Route path={Paths.DAOs.Members} element={<MembersList />} />
          <Route path={Paths.DAOs.Settings} element={<Settings />} />
        </Route>
        <Route path={`${Paths.DAOs.GovernanceToken}/:accountId`} element={<GovernanceDAODashboard />}>
          <Route index element={<Navigate to={Paths.DAOs.Overview} />} />
          <Route path={Paths.DAOs.Overview} element={<GovernanceDAODashboardOverview />} />
          <Route path={Paths.DAOs.Proposals} element={<ProposalList />} />
          <Route path={Paths.DAOs.Assets} element={<AssetsList />} />
          <Route path={Paths.DAOs.Staking} element={<NotFound message={`The staking page is under construction`} />} />
          <Route path={Paths.DAOs.Members} element={<MembersList />} />
          <Route path={Paths.DAOs.Settings} element={<DAOSettings />} />
        </Route>
        <Route
          path={`${Paths.DAOs.GovernanceToken}/:accountId/settings/change-dao-details`}
          element={<UpdateDAODetails />}
        >
          <Route index element={<Navigate to={Paths.DAOs.DetailsStep} />} />
          <Route path={Paths.DAOs.DetailsStep} element={<UpdateDAODetailsForm />} />
          <Route path={Paths.DAOs.ReviewStep} element={<UpdateDAODetailsReviewForm />} />
        </Route>
        <Route path={`${Paths.DAOs.NFT}/:accountId`} element={<NFTDAODashboard />}>
          <Route index element={<Navigate to={Paths.DAOs.Overview} />} />
          <Route path={Paths.DAOs.Overview} element={<NFTDAODashboardOverview />} />
          <Route path={Paths.DAOs.Proposals} element={<ProposalList />} />
          <Route path={Paths.DAOs.Assets} element={<NotFound message={`The assets page is under construction`} />} />
          <Route path={Paths.DAOs.Staking} element={<NotFound message={`The staking page is under construction`} />} />
          <Route path={Paths.DAOs.Members} element={<MembersList />} />
          <Route path={Paths.DAOs.Settings} element={<DAOSettings />} />
        </Route>
        <Route path={`${Paths.DAOs.NFT}/:accountId/settings/change-dao-details`} element={<UpdateDAODetails />}>
          <Route index element={<Navigate to={Paths.DAOs.DetailsStep} />} />
          <Route path={Paths.DAOs.DetailsStep} element={<UpdateDAODetailsForm />} />
          <Route path={Paths.DAOs.ReviewStep} element={<UpdateDAODetailsReviewForm />} />
        </Route>
        <Route path={`${Paths.DAOs.GovernanceToken}/:accountId/new-proposal`} element={<CreateDAOProposal />}>
          <Route index element={<Navigate to={Paths.DAOs.DAOProposalType} />} />
          <Route path={Paths.DAOs.DAOProposalType} element={<DAOProposalTypeForm />} />
          <Route path={Paths.DAOs.DAOTokenTransferDetails} element={<DAOTokenTransferDetailsForm />} />
          <Route path={Paths.DAOs.DAOTokenTransferReview} element={<DAOTokenTransferReviewForm />} />
          <Route path={Paths.DAOs.DAOContractUpgradeDetails} element={<DAOContractUpgradeDetailsForm />} />
          <Route path={Paths.DAOs.DAOContractUpgradeReview} element={<DAOContractUpgradeReviewForm />} />
          <Route path={Paths.DAOs.DAOTextProposalDetails} element={<DAOTextProposalDetailsForm />} />
          <Route path={Paths.DAOs.DAOTextProposalReview} element={<DAOTextProposalReviewForm />} />
          <Route path={Paths.DAOs.DAOTokenAssociateDetails} element={<DAOTokenAssociateDetailsForm />} />
          <Route path={Paths.DAOs.DAOTokenAssociateReview} element={<DAOTokenAssociateReviewForm />} />
        </Route>
        <Route path={`${Paths.DAOs.NFT}/:accountId/new-proposal`} element={<CreateDAOProposal />}>
          <Route index element={<Navigate to={Paths.DAOs.DAOProposalType} />} />
          <Route path={Paths.DAOs.DAOProposalType} element={<DAOProposalTypeForm />} />
          <Route path={Paths.DAOs.DAOTokenTransferDetails} element={<DAOTokenTransferDetailsForm />} />
          <Route path={Paths.DAOs.DAOTokenTransferReview} element={<DAOTokenTransferReviewForm />} />
          <Route path={Paths.DAOs.DAOTextProposalDetails} element={<DAOTextProposalDetailsForm />} />
          <Route path={Paths.DAOs.DAOTextProposalReview} element={<DAOTextProposalReviewForm />} />
        </Route>
        <Route path={`${Paths.DAOs.Multisig}/:accountId/new-proposal`} element={<CreateDAOProposal />}>
          <Route index element={<Navigate to={Paths.DAOs.DAOProposalType} />} />
          <Route path={Paths.DAOs.DAOProposalType} element={<DAOProposalTypeForm />} />
          <Route path={Paths.DAOs.DAOTextProposalDetails} element={<DAOTextProposalDetailsForm />} />
          <Route path={Paths.DAOs.DAOTextProposalReview} element={<DAOTextProposalReviewForm />} />
          <Route path={Paths.DAOs.DAOTokenTransferDetails} element={<DAOTokenTransferDetailsForm />} />
          <Route path={Paths.DAOs.DAOTokenTransferReview} element={<DAOTokenTransferReviewForm />} />
          <Route path={Paths.DAOs.DAOAddMemberDetails} element={<DAOAddMemberDetailsForm />} />
          <Route path={Paths.DAOs.DAOAddMemberReview} element={<DAOAddMemberReviewForm />} />
          <Route path={Paths.DAOs.DAODeleteMemberDetails} element={<DAODeleteMemberDetailsForm />} />
          <Route path={Paths.DAOs.DAODeleteMemberReview} element={<DAODeleteMemberReviewForm />} />
          <Route path={Paths.DAOs.DAOReplaceMemberDetails} element={<DAOReplaceMemberDetailsForm />} />
          <Route path={Paths.DAOs.DAOReplaceMemberReview} element={<DAOReplaceMemberReviewForm />} />
          <Route path={Paths.DAOs.DAOUpgradeThresholdDetails} element={<DAOUpgradeThresholdDetailsForm />} />
          <Route path={Paths.DAOs.DAOUpgradeThresholdReview} element={<DAOUpgradeThresholdReviewForm />} />
          <Route path={Paths.DAOs.DAOTokenAssociateDetails} element={<DAOTokenAssociateDetailsForm />} />
          <Route path={Paths.DAOs.DAOTokenAssociateReview} element={<DAOTokenAssociateReviewForm />} />
          <Route path={Paths.DAOs.DAOContractUpgradeDetails} element={<DAOContractUpgradeDetailsForm />} />
          <Route path={Paths.DAOs.DAOContractUpgradeReview} element={<DAOContractUpgradeReviewForm />} />
        </Route>
        <Route path={`${Paths.DAOs.Multisig}/:accountId/settings/change-dao-details`} element={<UpdateDAODetails />}>
          <Route index element={<Navigate to={Paths.DAOs.DetailsStep} />} />
          <Route path={Paths.DAOs.DetailsStep} element={<UpdateDAODetailsForm />} />
          <Route path={Paths.DAOs.ReviewStep} element={<UpdateDAODetailsReviewForm />} />
        </Route>
        <Route
          path={`${Paths.DAOs.Multisig}/:accountId/proposals/:transactionHash`}
          element={<ProposalDetailsPage />}
        />
        <Route
          path={`${Paths.DAOs.GovernanceToken}/:accountId/proposals/:proposalId`}
          element={<GovernanceProposalDetailsPage />}
        />
        <Route
          path={`${Paths.DAOs.NFT}/:accountId/proposals/:proposalId`}
          element={<GovernanceProposalDetailsPage />}
        />
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
