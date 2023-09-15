import { Outlet, useParams } from "react-router-dom";
import { GovernanceDAODetails, Member } from "@dao/services";
import { TokenBalance, useAccountTokenBalances, usePairedWalletDetails, useToken } from "@dex/hooks";
import { useDAOs, useFetchDAOMembers, useGetBlockedTokenBalance } from "@dao/hooks";
import { isNil, isNotNil, uniqBy } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { AccountId } from "@hashgraph/sdk";
import { GovernanceDAODetailsContext } from "./types";

export function GovernanceDAODashboard() {
  const { accountId: daoAccountId = "" } = useParams();
  const daosQueryResults = useDAOs<GovernanceDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { walletId, isWalletPaired } = usePairedWalletDetails();
  const tokenTransferGovernorAccountId = dao?.governors?.tokenTransferLogic
    ? AccountId.fromSolidityAddress(dao.governors.tokenTransferLogic).toString()
    : "";
  const accountTokenBalancesQueryResults = useAccountTokenBalances(tokenTransferGovernorAccountId);
  const blockedTokenBalancesQueryResults = useGetBlockedTokenBalance(
    tokenTransferGovernorAccountId,
    dao?.tokenId ?? ""
  );
  const { data: tokenBalances = [] } = accountTokenBalancesQueryResults;
  const { data: blockedBalance = 0 } = blockedTokenBalancesQueryResults;
  const { data: FTToken } = useToken(dao?.tokenId ?? "");
  const { data: daoMembers = [] } = useFetchDAOMembers(dao?.tokenHolderAddress ?? "");
  const isAdmin = dao?.adminId === walletId && isWalletPaired;

  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);
  const isError = daosQueryResults.isError || accountTokenBalancesQueryResults.isError;
  const isLoading = daosQueryResults.isLoading || accountTokenBalancesQueryResults.isLoading;
  const errorMessage = daosQueryResults.error?.message || accountTokenBalancesQueryResults.error?.message;
  const isSuccess = daosQueryResults.isSuccess;

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
    const tokenCount = tokenBalances?.length ?? 0;
    const activeMember = members.find((member) => member.accountId === walletId);
    const isMember = isNotNil(activeMember) && !isAdmin && isWalletPaired;
    const totalAssetValue = tokenBalances?.reduce((total: number, token: TokenBalance) => total + token.value, 0) ?? 0;
    return (
      <DAODashboard
        isMember={isMember}
        isAdmin={isAdmin}
        dao={dao}
        isNotFound={isNotFound}
        isDAOFound={isDAOFound}
        isError={isError}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
      >
        <Outlet
          context={
            {
              dao,
              members,
              memberCount,
              tokenCount,
              ownerCount: 0,
              totalAssetValue,
              FTToken,
              tokenBalances,
              blockedBalance,
            } satisfies GovernanceDAODetailsContext
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
    />
  );
}
