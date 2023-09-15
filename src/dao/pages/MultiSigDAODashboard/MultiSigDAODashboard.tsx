import { TokenBalance, useAccountTokenBalances, usePairedWalletDetails } from "@dex/hooks";
import { useDAOs } from "@dao/hooks";
import { Member, MultiSigDAODetails } from "@dao/services";
import { Outlet, useParams } from "react-router-dom";
import { isNil, isNotNil } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { MultiSigDAODetailsContext } from "./types";

export function MultiSigDAODashboard() {
  const { accountId: daoAccountId = "" } = useParams();
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { isWalletPaired, walletId } = usePairedWalletDetails();

  const accountTokenBalancesQueryResults = useAccountTokenBalances(dao?.safeId ?? "");
  const { data: tokenBalances = [] } = accountTokenBalancesQueryResults;

  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);
  const isError = daosQueryResults.isError || accountTokenBalancesQueryResults.isError;
  const isLoading = daosQueryResults.isLoading || accountTokenBalancesQueryResults.isLoading;
  const errorMessage = daosQueryResults.error?.message || accountTokenBalancesQueryResults.error?.message;
  const isSuccess = daosQueryResults.isSuccess && accountTokenBalancesQueryResults.isSuccess;

  if (isDAOFound && isSuccess) {
    const { adminId, ownerIds } = dao;
    const isAdmin = walletId === adminId && isWalletPaired;
    const isMember = ownerIds.includes(walletId ?? "") && isWalletPaired;
    const members: Member[] = ownerIds.map((memberId: string) => ({
      name: "-",
      logo: "",
      accountId: memberId,
    }));
    const totalAssetValue = tokenBalances?.reduce((total: number, token: TokenBalance) => total + token.value, 0);

    return (
      <DAODashboard
        dao={dao}
        isMember={isMember}
        isAdmin={isAdmin}
        isNotFound={isNotFound}
        isDAOFound={isDAOFound}
        isError={isError}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isSuccess={isSuccess}
      >
        <Outlet
          context={
            { dao, tokenBalances, members, totalAssetValue, blockedBalance: 0 } satisfies MultiSigDAODetailsContext
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
