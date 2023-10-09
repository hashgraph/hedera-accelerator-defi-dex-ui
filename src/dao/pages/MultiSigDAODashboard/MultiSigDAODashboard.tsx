import { TokenBalance, useAccountTokenBalances, usePairedWalletDetails } from "@dex/hooks";
import { useFetchContract, useDAOs } from "@dao/hooks";
import { Member, MultiSigDAODetails } from "@dao/services";
import { Outlet, useParams } from "react-router-dom";
import { isNil, isNotNil } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { MultiSigDAODetailsContext } from "./types";

export function MultiSigDAODashboard() {
  const { accountId = "" } = useParams();
  const daoAccountIdQueryResults = useFetchContract(accountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs<MultiSigDAODetails>();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() === daoAccountEVMAddress?.toLowerCase());
  const { isWalletPaired, walletId } = usePairedWalletDetails();

  const daoSafeIdQueryResults = useFetchContract(dao?.safeEVMAddress ?? "");
  const daoSafeId = daoSafeIdQueryResults.data?.data.contract_id;
  const accountTokenBalancesQueryResults = useAccountTokenBalances(daoSafeId ?? "");
  const { data: tokenBalances = [] } = accountTokenBalancesQueryResults;

  const isNotFound = daosQueryResults.isSuccess && daoAccountIdQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && daoAccountIdQueryResults.isSuccess && isNotNil(dao);
  const isError =
    daosQueryResults.isError || accountTokenBalancesQueryResults.isError || daoAccountIdQueryResults.isError;
  const isLoading =
    daosQueryResults.isLoading || accountTokenBalancesQueryResults.isLoading || daoAccountIdQueryResults.isLoading;
  const errorMessage =
    daosQueryResults.error?.message ||
    accountTokenBalancesQueryResults.error?.message ||
    daoAccountIdQueryResults.error?.message;
  const isSuccess =
    daosQueryResults.isSuccess && accountTokenBalancesQueryResults.isSuccess && daoAccountIdQueryResults.isSuccess;

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
        <Outlet context={{ dao, tokenBalances, members, totalAssetValue } satisfies MultiSigDAODetailsContext} />
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
