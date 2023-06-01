import { Box, Flex, Tab, TabList, Tabs } from "@chakra-ui/react";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page, PageLayout } from "@layouts";
import { Color } from "@dex-ui-components";
import { TokenBalance, useAccountTokenBalances, useDAOs, useTabFilters } from "@hooks";
import { DashboardHeader } from "./DashboardHeader";
import { Member, MultiSigDAODetails } from "@services";
import { useLocation, Outlet, NavLink, useNavigate, useParams } from "react-router-dom";
import { Paths } from "@routes";
import { isNil, isNotNil } from "ramda";

const daoNavigationTabs = ["Dashboard", "Proposals", "Assets", "Members", "Settings"];

export function MultiSigDAODashboard() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "" } = useParams();
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);

  const location = useLocation();

  const currentTabNameByRoute = location.pathname.split("/").at(-1) ?? "";
  const tabIndexByRoute = daoNavigationTabs.map((tab) => tab.toLowerCase()).indexOf(currentTabNameByRoute);
  const intialTabIndex = tabIndexByRoute === -1 ? 0 : tabIndexByRoute;
  const { handleTabChange } = useTabFilters(intialTabIndex);

  const accountTokenBalancesQueryResults = useAccountTokenBalances(dao?.safeId ?? "");
  const { data: tokenBalances } = accountTokenBalancesQueryResults;

  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);
  const isError = daosQueryResults.isError || accountTokenBalancesQueryResults.isError;
  const isLoading = daosQueryResults.isLoading || accountTokenBalancesQueryResults.isLoading;
  const errorMessage = daosQueryResults.error?.message || accountTokenBalancesQueryResults.error?.message;
  const isSuccess = daosQueryResults.isSuccess && accountTokenBalancesQueryResults.isSuccess;

  function onBackToDAOsLinkClick() {
    navigate(Paths.DAOs.absolute);
  }

  if (isError) {
    return <ErrorLayout message={errorMessage} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isNotFound) {
    return (
      <NotFound
        message={`We didn't find any data for this DAO (${daoAccountId}).`}
        preLinkText={""}
        linkText={"Click here to return to the DAOs list page."}
        onLinkClick={onBackToDAOsLinkClick}
      />
    );
  }

  if (isDAOFound && dao.isPrivate) {
    return (
      <NotFound
        message={`This DAO is private (${daoAccountId}).`}
        preLinkText={""}
        linkText={"Click here to return to the DAOs list page."}
        onLinkClick={onBackToDAOsLinkClick}
      />
    );
  }

  if (isDAOFound && isSuccess) {
    const { accountId, type, adminId, name, safeId, ownerIds } = dao;

    const ownerCount = ownerIds.length;
    const members: Member[] = [adminId, ...ownerIds].map((ownerId: string) => ({
      name: "-",
      logo: "",
      accountId: ownerId,
    }));
    const memberCount = members.length;
    const tokenCount = tokenBalances?.length;
    const totalAssetValue = tokenBalances?.reduce((total: number, token: TokenBalance) => total + token.value, 0);

    return (
      <Page
        gap={0}
        type={PageLayout.Dashboard}
        header={<DashboardHeader daoAccountId={accountId} safeAccountId={safeId} name={name} type={type} />}
        body={
          <Tabs defaultIndex={intialTabIndex} onChange={handleTabChange} isLazy bg={Color.White_02}>
            <Flex flex="row" padding="0px 80px">
              <TabList borderBottom="0">
                {daoNavigationTabs.map((tabId: string, index: number) => {
                  return (
                    <Tab
                      key={index}
                      tabIndex={index}
                      height="fit-content"
                      padding="0"
                      textStyle="p medium medium"
                      color={Color.Neutral._400}
                      _selected={{ color: Color.Neutral._900, borderBottom: `4px solid ${Color.Primary._500}` }}
                    >
                      <NavLink style={{ padding: "0.75rem 1.25rem" }} to={tabId.toLowerCase()}>
                        {tabId}
                      </NavLink>
                    </Tab>
                  );
                })}
              </TabList>
            </Flex>
            <Box bg={Color.Primary_Bg} padding="2rem 80px 16px" minHeight="80vh">
              <Outlet context={{ dao, tokenBalances, members, memberCount, tokenCount, ownerCount, totalAssetValue }} />
            </Box>
          </Tabs>
        }
      />
    );
  }

  return <></>;
}
