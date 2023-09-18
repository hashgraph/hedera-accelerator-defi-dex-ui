import { Outlet, useParams } from "react-router-dom";
import { Member, NFTDAODetails } from "@dao/services";
import { TokenBalance, useAccountTokenBalances, useHandleTransactionSuccess, usePairedWalletDetails } from "@dex/hooks";
import { useDAOs, useMintNFT, useFetchDAOMembers, useGetBlockedTokenBalance } from "@dao/hooks";
import { isNil, isNotNil, uniqBy } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { TransactionResponse } from "@hashgraph/sdk";
import { NFTDAODetailsContext } from "./types";
import { solidityAddressToAccountIdString } from "@shared/utils";

export function NFTDAODashboard() {
  const { accountId: daoAccountId = "" } = useParams();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const daosQueryResults = useDAOs<NFTDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { walletId, isWalletPaired } = usePairedWalletDetails();
  const tokenTransferGovernorAccountId = dao?.governors?.tokenTransferLogic
    ? solidityAddressToAccountIdString(dao.governors.tokenTransferLogic)
    : "";
  const accountTokenBalancesQueryResults = useAccountTokenBalances(tokenTransferGovernorAccountId);
  const blockedTokenBalancesQueryResults = useGetBlockedTokenBalance(
    tokenTransferGovernorAccountId,
    dao?.tokenId ?? ""
  );
  const mintNFT = useMintNFT(handleMintNFTTokensSuccess);
  const { data: tokenBalances = [] } = accountTokenBalancesQueryResults;
  const { data: blockedBalance = [] } = blockedTokenBalancesQueryResults;
  const { data: daoMembers = [] } = useFetchDAOMembers(dao?.tokenHolderAddress ?? "");
  const isAdmin = dao?.adminId === walletId && isWalletPaired;
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);
  const isError = daosQueryResults.isError || accountTokenBalancesQueryResults.isError;
  const isLoading = daosQueryResults.isLoading || accountTokenBalancesQueryResults.isLoading;
  const errorMessage = daosQueryResults.error?.message || accountTokenBalancesQueryResults.error?.message;
  const isSuccess = daosQueryResults.isSuccess;

  const handleMintNFT = (tokenLinks: string[]) => {
    mintNFT.mutate({ tokenId: dao?.tokenId ?? "", tokenLinks });
  };

  function handleMintNFTTokensSuccess(transactionResponse: TransactionResponse) {
    const message = "Successfully minted NFT tokens";
    handleTransactionSuccess(transactionResponse, message);
  }

  if (dao) {
    const { adminId } = dao;
    const adminAsMember: Member[] = [adminId].map((ownerId: string) => ({
      name: "-",
      logo: "",
      accountId: ownerId,
    }));
    const allMembers = [...adminAsMember, ...daoMembers];
    const members = uniqBy((member: Member) => member.accountId, allMembers);
    const memberCount = members.length;
    const activeMember = members.find((member) => member.accountId === walletId);
    const isMember = isNotNil(activeMember) && !isAdmin && isWalletPaired;
    const tokenCount = tokenBalances?.length;
    const totalAssetValue = tokenBalances?.reduce((total: number, token: TokenBalance) => total + token.value, 0);
    return (
      <DAODashboard
        isAdmin={isAdmin}
        isMember={isMember}
        dao={dao}
        isNotFound={isNotFound}
        isDAOFound={isDAOFound}
        isError={isError}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        handleMintNFT={handleMintNFT}
      >
        <Outlet
          context={
            {
              dao,
              tokenBalances,
              members,
              memberCount,
              tokenCount,
              ownerCount: 0,
              totalAssetValue,
              blockedBalance,
            } satisfies NFTDAODetailsContext
          }
        />
      </DAODashboard>
    );
  }

  return (
    <DAODashboard
      isNotFound={isNotFound}
      isDAOFound={isDAOFound}
      isError={isError}
      isLoading={isLoading}
      errorMessage={errorMessage}
      isSuccess={isSuccess}
    ></DAODashboard>
  );
}
