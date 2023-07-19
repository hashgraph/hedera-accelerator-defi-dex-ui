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
  const { accountId: daoAccountId = "" } = useParams();
  const { dao, isNotFound, isDAOFound, isError, isLoading, errorMessage, isSuccess, isMember, isAdmin, handleMintNFT } =
    props;
  const { type = "" } = dao ?? {};
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
        return daoTabs.filter((tab) => tab.title !== "Assets");
      default:
        return [];
    }
  }
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
            isAdmin={isAdmin}
            isMember={isMember}
            daoAccountId={accountId}
            name={name}
            type={type}
            logoUrl={logoUrl}
            govTokenId={tokenId}
            safeId={safeId}
            handleMintNFT={handleMintNFT}
          />
        }
        body={
          <Flex direction="column" gap="1rem">
            {isVotingPowerVisible ? (
              <VotingPower governanceTokenId={tokenId} tokenHolderAddress={tokenHolderAddress} />
            ) : undefined}
            <Tabs
              defaultIndex={initialTabIndex}
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
                          <Flex gap={2.5} alignItems="center" justifyContent="center">
                            {tab.icon}
                            <Box>{tab.title}</Box>
                          </Flex>
                        </NavLink>
                      </Tab>
                    );
                  })}
                </TabList>
              </Flex>
              <Box bg={Color.Primary_Bg} minHeight="80vh">
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
