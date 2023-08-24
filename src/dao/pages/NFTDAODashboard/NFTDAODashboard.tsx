import { Outlet, useParams } from "react-router-dom";
import { Member, NFTDAODetails } from "@dao/services";
import { TokenBalance, useAccountTokenBalances, useHandleTransactionSuccess } from "@dex/hooks";
import { useDAOs, useMintNFT } from "@dao/hooks";
import { isNil, isNotNil } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { TransactionResponse } from "@hashgraph/sdk";
import { AccountId } from "@hashgraph/sdk";

export function NFTDAODashboard() {
  const { accountId: daoAccountId = "" } = useParams();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const daosQueryResults = useDAOs<NFTDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const tokenTransferGovernorAccountId = dao?.governors?.tokenTransferLogic
    ? AccountId.fromSolidityAddress(dao.governors.tokenTransferLogic).toString()
    : "";
  const accountTokenBalancesQueryResults = useAccountTokenBalances(tokenTransferGovernorAccountId);
  const mintNFT = useMintNFT(handleMintNFTTokensSuccess);
  const { data: tokenBalances } = accountTokenBalancesQueryResults;

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
    const ownerCount = 0;
    const members: Member[] = [adminId].map((ownerId: string) => ({
      name: "-",
      logo: "",
      accountId: ownerId,
    }));
    const memberCount = members.length;
    const tokenCount = tokenBalances?.length;
    const totalAssetValue = tokenBalances?.reduce((total: number, token: TokenBalance) => total + token.value, 0);
    return (
      <DAODashboard
        dao={dao}
        isNotFound={isNotFound}
        isDAOFound={isDAOFound}
        isError={isError}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
        handleMintNFT={handleMintNFT}
      >
        <Outlet context={{ dao, tokenBalances, members, memberCount, tokenCount, ownerCount, totalAssetValue }} />
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
