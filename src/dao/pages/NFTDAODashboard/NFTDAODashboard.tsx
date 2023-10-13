import { Outlet, useParams } from "react-router-dom";
import { Member, NFTDAODetails } from "@dao/services";
import {
  TokenBalance,
  useAccountTokenBalances,
  useHandleTransactionSuccess,
  usePairedWalletDetails,
  useToken,
} from "@dex/hooks";
import { useDAOs, useMintNFT, useFetchDAOMembers, useFetchContract } from "@dao/hooks";
import { isNil, isNotNil, uniqBy } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { TransactionResponse } from "@hashgraph/sdk";
import { NFTDAODetailsContext } from "./types";

export function NFTDAODashboard() {
  const { accountId = "" } = useParams();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const daoAccountIdQueryResults = useFetchContract(accountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs<NFTDAODetails>();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() == daoAccountEVMAddress?.toLowerCase());
  const { walletId, isWalletPaired } = usePairedWalletDetails();

  const daoAssetHolderQueryResults = useFetchContract(dao?.assetsHolderAddress ?? "");
  const daoAssetHolder = daoAssetHolderQueryResults.data?.data.contract_id ?? "";
  const accountTokenBalancesQueryResults = useAccountTokenBalances(daoAssetHolder);
  const mintNFT = useMintNFT(handleMintNFTTokensSuccess);
  const { data: tokenBalances = [] } = accountTokenBalancesQueryResults;
  const { data: NFTToken } = useToken(dao?.tokenId ?? "");
  const { data: daoMembers = [] } = useFetchDAOMembers(dao?.tokenHolderAddress ?? "");
  const isAdmin = dao?.adminId === walletId && isWalletPaired;

  const isSuccess = daosQueryResults.isSuccess && daoAccountIdQueryResults.isSuccess;
  const isNotFound = isSuccess && isNil(dao);
  const isDAOFound = isSuccess && isNotNil(dao);
  const isError =
    daosQueryResults.isError || accountTokenBalancesQueryResults.isError || daoAccountIdQueryResults.isError;
  const isLoading = daosQueryResults.isLoading || daoAccountIdQueryResults.isLoading;
  const errorMessage =
    daosQueryResults.error?.message ||
    accountTokenBalancesQueryResults.error?.message ||
    daoAccountIdQueryResults.error?.message;

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
              NFTToken,
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
