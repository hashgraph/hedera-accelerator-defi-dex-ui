import { Outlet, useParams } from "react-router-dom";
import { GovernanceDAODetails, Member } from "@dao/services";
import { TokenBalance, useAccountTokenBalances, usePairedWalletDetails, useToken } from "@dex/hooks";
import { useFetchContract, useDAOs, useFetchDAOMembers } from "@dao/hooks";
import { isNil, isNotNil, uniqBy } from "ramda";
import { DAODashboard } from "../DAODashboard";
import { GovernanceDAODetailsContext } from "./types";

export function GovernanceDAODashboard() {
  const { accountId = "" } = useParams();
  const daoAccountIdQueryResults = useFetchContract(accountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs<GovernanceDAODetails>();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() == daoAccountEVMAddress?.toLowerCase());
  const { walletId, isWalletPaired } = usePairedWalletDetails();

  const daoAssetHolderQueryResults = useFetchContract(dao?.assetsHolderAddress ?? "");
  const daoAssetHolder = daoAssetHolderQueryResults.data?.data.contract_id ?? "";
  const accountTokenBalancesQueryResults = useAccountTokenBalances(daoAssetHolder);
  const { data: tokenBalances = [] } = accountTokenBalancesQueryResults;
  const { data: FTToken } = useToken(dao?.tokenId ?? "");
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
