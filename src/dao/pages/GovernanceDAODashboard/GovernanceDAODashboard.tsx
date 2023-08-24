import { Outlet, useParams } from "react-router-dom";
import { GovernanceDAODetails, Member } from "@dao/services";
import {
  TokenBalance,
  useTokenBalance,
  usePairedWalletDetails,
  useToken,
  useMultipleAccountTokenBalances,
} from "@dex/hooks";
import { useDAOs } from "@dao/hooks";
import { isNil, isNotNil } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { AccountId } from "@hashgraph/sdk";

export function GovernanceDAODashboard() {
  const { accountId: daoAccountId = "" } = useParams();
  const daosQueryResults = useDAOs<GovernanceDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { walletId, isWalletPaired } = usePairedWalletDetails();
  const { governors } = dao ?? {};
  const governorArray = isNotNil(governors)
    ? Object.values(governors).map((address) => AccountId.fromSolidityAddress(address).toString())
    : [];
  const accountTokenBalancesQueryResults = useMultipleAccountTokenBalances(governorArray);
  const { data: tokenBalances } = accountTokenBalancesQueryResults;
  const { data: daoGovTokenBalance = 0 } = useTokenBalance({ tokenId: dao?.tokenId ?? "" });
  const { data: FTToken } = useToken(dao?.tokenId ?? "");
  const isAdmin = dao?.adminId === walletId && isWalletPaired;
  const isMember = daoGovTokenBalance > 0 && !isAdmin && isWalletPaired;

  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);
  const isError = daosQueryResults.isError || accountTokenBalancesQueryResults.isError;
  const isLoading = daosQueryResults.isLoading || accountTokenBalancesQueryResults.isLoading;
  const errorMessage = daosQueryResults.error?.message || accountTokenBalancesQueryResults.error?.message;
  const isSuccess = daosQueryResults.isSuccess;

  if (dao) {
    const { adminId } = dao;
    const ownerCount = 0;
    //TODO: members flow need to be updated for governance dao, if would depend on who possesses the token.
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
          context={{ dao, members, memberCount, tokenCount, ownerCount, totalAssetValue, FTToken, tokenBalances }}
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
