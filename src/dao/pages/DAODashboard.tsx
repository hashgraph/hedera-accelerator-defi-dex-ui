import { Box, Flex, Tab, TabList, Tabs, useBreakpointValue } from "@chakra-ui/react";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page, PageLayout } from "@dex/layouts";
import { BoxIcon, LayoutIcon, LockIcon2, SettingsIcon, TransactionIcon, UsersIcon, useTheme } from "@shared/ui-kit";
import { useTabFilters } from "@dex/hooks";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { PropsWithChildren } from "react";
import { DAO, DAOType, GovernanceDAODetails, MultiSigDAODetails, NFTDAODetails } from "@dao/services";
import { DashboardHeader } from "./DashboardHeader";
import { Routes } from "@dao/routes";
import { VotingPower } from "@dex/pages/Governance/VotingPower";
import { NFTVotingPower } from "./NFTVotingPower";
import { useFetchContract } from "@dao/hooks";

const TabsHeight = 44;

interface DAODashboardProps extends PropsWithChildren {
  dao?: DAO;
  isMember?: boolean;
  isAdmin?: boolean;
  isNotFound: boolean;
  isDAOFound: boolean;
  isError: boolean;
  isLoading: boolean;
  errorMessage?: string;
  isSuccess: boolean;
  handleMintNFT?: (tokenLinks: string[]) => void;
}

export function DAODashboard(props: DAODashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { accountId: daoAccountId = "" } = useParams();

  // All hooks must be called before any early returns
  const tabPadding = useBreakpointValue({
    base: "0px 1rem",
    sm: "0px 1.5rem",
    md: "0px 2rem",
    lg: "0px 3rem",
    xl: "0px 5rem",
  });
  const showTabText = useBreakpointValue({ base: false, md: true });

  const daoTabs = [
    {
      icon: <LayoutIcon boxSize="4" />,
      title: "Overview",
    },
    {
      icon: <TransactionIcon boxSize="4" />,
      title: "Proposals",
    },
    {
      icon: <BoxIcon boxSize="4" />,
      title: "Assets",
    },
    {
      icon: <LockIcon2 boxSize="4" />,
      title: "Staking",
    },
    {
      icon: <UsersIcon boxSize="4" />,
      title: "Members",
    },
    {
      icon: <SettingsIcon boxSize="4" />,
      title: "Settings",
    },
  ];

  const { dao, isNotFound, isDAOFound, isError, isLoading, errorMessage, isSuccess, isMember, isAdmin, handleMintNFT } =
    props;
  const { type = "", infoUrl } = dao ?? {};
  const { tokenId, tokenHolderAddress } = (dao || {}) as GovernanceDAODetails | NFTDAODetails;
  const daoTokenHolderQueryResults = useFetchContract(tokenHolderAddress ?? "");
  const daoTokenHolder = daoTokenHolderQueryResults.data?.data.contract_id ?? "";
  const currentTabNameByRoute = location.pathname.split("/").at(-1) ?? "";
  const daoNavigationTabs = GetDAONavigationTabs();
  const tabIndexByRoute = daoNavigationTabs.map((tab) => tab.title.toLowerCase()).indexOf(currentTabNameByRoute);
  const initialTabIndex = tabIndexByRoute === -1 ? 0 : tabIndexByRoute;
  const { handleTabChange } = useTabFilters(initialTabIndex);

  function GetDAONavigationTabs() {
    switch (type) {
      case DAOType.MultiSig:
        return daoTabs.filter((tab) => tab.title !== "Staking");
      case DAOType.GovernanceToken:
      case DAOType.NFT:
        return daoTabs.filter((tab) => tab.title !== "Staking");

      //        return daoTabs;
      default:
        return [];
    }
  }
  function onBackToDAOsLinkClick() {
    navigate(Routes.Home);
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
  /*
 If you know the contract, you can view the DAO

  if (isDAOFound && dao?.isPrivate) {
    return (
      <NotFound
        message={`This DAO is private (${daoAccountId}).`}
        preLinkText={""}
        linkText={"Click here to return to the DAOs list page."}
        onLinkClick={onBackToDAOsLinkClick}
      />
    );
  }
*/

  if (dao && isDAOFound && isSuccess) {
    const { accountEVMAddress, type, name, logoUrl } = dao;
    const isGovernance = type === DAOType.GovernanceToken;
    const isNFT = type === DAOType.NFT;
    const { safeEVMAddress } = dao as MultiSigDAODetails;

    return (
      <Page
        gap={0}
        type={PageLayout.Dashboard}
        header={
          <DashboardHeader
            isAdmin={isAdmin}
            isMember={isMember}
            accountEVMAddress={accountEVMAddress}
            name={name}
            type={type}
            logoUrl={logoUrl}
            infoUrl={infoUrl}
            govTokenId={tokenId}
            safeEVMAddress={safeEVMAddress}
            handleMintNFT={handleMintNFT}
            isPrivate={dao.isPrivate}
          />
        }
        body={
          <Flex direction="column" gap="0.75rem" height="100%" bg={theme.bg}>
            {isGovernance ? (
              <VotingPower governanceTokenId={tokenId} tokenHolderAddress={daoTokenHolder} />
            ) : (
              <Box></Box>
            )}
            {isNFT ? <NFTVotingPower governanceTokenId={tokenId} tokenHolderAddress={daoTokenHolder} /> : <Box></Box>}
            <Tabs
              defaultIndex={initialTabIndex}
              onChange={handleTabChange}
              isLazy
              bg={theme.bg}
              variant="dao-dashboard-tab"
              height="100%"
            >
              <Flex
                flex="row"
                padding={tabPadding}
                borderBottom={`1px solid ${theme.border}`}
                overflowX="auto"
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                <TabList borderBottom="0" gap={{ base: 0, md: 1 }}>
                  {daoNavigationTabs.map((tab, index: number) => {
                    return (
                      <NavLink to={tab.title.toLowerCase()} key={index}>
                        <Tab
                          tabIndex={index}
                          px={{ base: 2, md: 4 }}
                          py={2}
                          color={theme.textMuted}
                          _selected={{
                            color: theme.accentLight,
                            borderBottom: `2px solid ${theme.accentLight}`,
                          }}
                          _hover={{
                            color: theme.text,
                          }}
                        >
                          <Flex gap={{ base: 0, md: 2.5 }} alignItems="center" justifyContent="center">
                            {tab.icon}
                            {showTabText && <Box>{tab.title}</Box>}
                          </Flex>
                        </Tab>
                      </NavLink>
                    );
                  })}
                </TabList>
              </Flex>
              <Box bg={theme.bg} height={`calc(100% - ${TabsHeight}px)`}>
                {props.children}
              </Box>
            </Tabs>
          </Flex>
        }
      />
    );
  }
  return <></>;
}
