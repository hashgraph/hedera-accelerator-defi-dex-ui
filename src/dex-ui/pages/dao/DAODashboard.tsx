import { Box, Flex, Tab, TabList, Tabs } from "@chakra-ui/react";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page, PageLayout } from "@layouts";
import { Color, LayoutIcon, TransactionIcon, BoxIcon, LockIcon2, UsersIcon, SettingsIcon } from "@dex-ui-components";
import { useTabFilters } from "@hooks";
import { useLocation, NavLink, useNavigate, useParams } from "react-router-dom";
import { PropsWithChildren } from "react";
import { DAO, DAOType, GovernanceDAODetails, MultiSigDAODetails, NFTDAODetails } from "@services";
import { DashboardHeader } from "./DashboardHeader";
import { Paths } from "@routes";
import { VotingPower } from "../Governance/VotingPower";

const daoNavigationTabs = [
  {
    icon: <LayoutIcon boxSize="5" />,
    title: "Overview",
  },
  {
    icon: <TransactionIcon boxSize="5" />,
    title: "Proposals",
  },
  {
    icon: <BoxIcon boxSize="5" />,
    title: "Assets",
  },
  {
    icon: <LockIcon2 boxSize="5" />,
    title: "Staking",
  },
  {
    icon: <UsersIcon boxSize="5" />,
    title: "Members",
  },
  {
    icon: <SettingsIcon boxSize="5" />,
    title: "Settings",
  },
];

interface DAODashboardProps extends PropsWithChildren {
  dao?: DAO;
  isNotFound: boolean;
  isDAOFound: boolean;
  isError: boolean;
  isLoading: boolean;
  errorMessage?: string;
  isSuccess: boolean;
}

export function DAODashboard(props: DAODashboardProps) {
  const { dao, isNotFound, isDAOFound, isError, isLoading, errorMessage, isSuccess } = props;
  const navigate = useNavigate();
  const { accountId: daoAccountId = "" } = useParams();

  const location = useLocation();

  const currentTabNameByRoute = location.pathname.split("/").at(-1) ?? "";
  const tabIndexByRoute = daoNavigationTabs.map((tab) => tab.title.toLowerCase()).indexOf(currentTabNameByRoute);
  const intialTabIndex = tabIndexByRoute === -1 ? 0 : tabIndexByRoute;
  const { handleTabChange } = useTabFilters(intialTabIndex);

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

  if (dao && isDAOFound && isSuccess) {
    const { accountId, type, name, logoUrl } = dao;
    const isVotingPowerVisible = type === DAOType.GovernanceToken || type === DAOType.NFT;
    const { tokenId, tokenHolderAddress } = dao as GovernanceDAODetails | NFTDAODetails;
    const { safeId } = dao as MultiSigDAODetails;

    return (
      <Page
        gap={0}
        type={PageLayout.Dashboard}
        header={
          <DashboardHeader
            daoAccountId={accountId}
            name={name}
            type={type}
            logoUrl={logoUrl}
            govTokenId={tokenId}
            safeId={safeId}
          />
        }
        body={
          <Flex direction="column" gap="1rem">
            {isVotingPowerVisible ? (
              <VotingPower governanceTokenId={tokenId} tokenHolderAddress={tokenHolderAddress} />
            ) : undefined}
            <Tabs
              defaultIndex={intialTabIndex}
              onChange={handleTabChange}
              isLazy
              bg={Color.White_02}
              variant="dao-dashboard-tab"
            >
              <Flex flex="row" padding="0px 80px" borderBottom={`1px solid ${Color.Neutral._200}`}>
                <TabList borderBottom="0">
                  {daoNavigationTabs.map((tab, index: number) => {
                    return (
                      <Tab key={index} tabIndex={index}>
                        <NavLink style={{ padding: "0.75rem 1.25rem" }} to={tab.title.toLowerCase()}>
                          <Flex gap={2.5} alignContent="center" justifyContent="center">
                            {tab.icon}
                            <Box>{tab.title}</Box>
                          </Flex>
                        </NavLink>
                      </Tab>
                    );
                  })}
                </TabList>
              </Flex>
              <Box bg={Color.Primary_Bg} padding="2rem 80px 16px" minHeight="80vh">
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
