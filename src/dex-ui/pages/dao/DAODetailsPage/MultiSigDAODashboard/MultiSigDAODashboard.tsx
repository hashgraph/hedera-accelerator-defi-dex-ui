import { Box, Center, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { LoadingSpinnerLayout, Page, PageLayout } from "@layouts";
import { Color, Notification, NotficationTypes, useNotification } from "@dex-ui-components";
import { useAccountTokenBalances, useTabFilters } from "@hooks";
import { TransactionsList } from "./TransactionsList";
import { MembersList } from "./MembersList";
import { AssetsList } from "./AssetsList";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardHeader } from "./DashboardHeader";
import { MultiSigDAODetails } from "@services";
import { useLocation } from "react-router-dom";
import { Settings } from "./Settings";

export interface Member {
  name: string;
  logo: string;
  accountId: string;
}

const daoNavigationTabs = ["Dashboard", "Transactions", "Assets", "Members", "Settings"];
interface MultiSigDAODashboardProps {
  dao: MultiSigDAODetails;
}

export function MultiSigDAODashboard(props: MultiSigDAODashboardProps) {
  const { dao } = props;
  const { handleTabChange } = useTabFilters();
  const location = useLocation();
  const notification = useNotification({
    successMessage: location.state?.createDAOSuccessMessage,
    transactionState: location.state?.transactionState,
  });

  const useAccountTokenBalancesQueryResults = useAccountTokenBalances(dao?.safeId);
  const { error, isSuccess, isError, isLoading, data: tokenBalances } = useAccountTokenBalancesQueryResults;

  if (isError) {
    return (
      <Text textStyle="h2_empty_or_error" margin="auto">
        Error: {error?.message}
      </Text>
    );
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isSuccess) {
    const { accountId, type, adminId, name, safeId, ownerIds, threshold } = dao;
    const members: Member[] = [adminId, ...ownerIds].map((ownerId: string) => ({
      name: "-",
      logo: "",
      accountId: ownerId,
    }));
    const memberCount = members.length;
    const tokenCount = tokenBalances.length;
    const totalAssetValue = tokenBalances.reduce((total, token) => total + token.value, 0);

    return (
      <Page
        gap={0}
        type={PageLayout.Dashboard}
        header={
          <>
            {notification.isSuccessNotificationVisible && (
              <Center>
                <Box padding="16px 80px 0 80px" maxWidth="fit-content" paddingTop="1rem">
                  <Notification
                    type={NotficationTypes.SUCCESS}
                    textStyle="b3"
                    message={notification.successNotificationMessage}
                    isLinkShown={true}
                    linkText="View in HashScan"
                    linkRef={notification.hashscanTransactionLink}
                    isCloseButtonShown={true}
                    handleClickClose={notification.handleCloseNotificationButtonClicked}
                  />
                </Box>
              </Center>
            )}
            <DashboardHeader daoAccountId={accountId} safeAccountId={safeId} name={name} type={type} />
          </>
        }
        body={
          <Tabs onChange={handleTabChange} isLazy bg={Color.White_02}>
            <Flex flex="row" padding="0px 80px">
              <TabList borderBottom="0">
                {daoNavigationTabs.map((tabId: string, index: number) => {
                  return (
                    <Tab
                      key={index}
                      id={tabId}
                      height="fit-content"
                      padding="0.75rem 1.25rem"
                      textStyle="p medium medium"
                      color={Color.Neutral._400}
                      _selected={{ color: Color.Neutral._900, borderBottom: `4px solid ${Color.Primary._500}` }}
                    >
                      {tabId}
                    </Tab>
                  );
                })}
              </TabList>
            </Flex>
            <TabPanels bg={Color.Primary_Bg} padding="0px 80px 16px" minHeight="80vh">
              <TabPanel key={0} padding="2rem 0 0">
                <DashboardOverview
                  totalAssetValue={totalAssetValue}
                  tokenCount={tokenCount}
                  memberCount={memberCount}
                  threshold={threshold}
                />
              </TabPanel>
              <TabPanel key={1} padding="1rem 0 0">
                <TransactionsList daoAccountId={accountId} safeAccountId={safeId} threshold={threshold} />
              </TabPanel>
              <TabPanel key={2} padding="2rem 0 0">
                <AssetsList assets={tokenBalances} totalAssetValue={totalAssetValue} />
              </TabPanel>
              <TabPanel key={3} padding="2rem 0 0">
                <MembersList members={members} memberCount={memberCount} adminAccountId={adminId} />
              </TabPanel>
              <TabPanel key={4} padding="2rem 0 0">
                <Settings daoDetails={dao} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        }
      />
    );
  }

  return <></>;
}
