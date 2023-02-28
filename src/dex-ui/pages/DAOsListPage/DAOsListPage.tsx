import { Text, SimpleGrid, Box, Link, Flex, Skeleton, Center } from "@chakra-ui/react";
import { Page, PageHeader } from "../../layouts";
import { Button, Color, Notification, useNotification, NotficationTypes } from "../../../dex-ui-components";
import { DAOCard } from "./DAOCard";
import { useDAOs, useDexContext } from "../../hooks";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { useLocation, useNavigate } from "react-router-dom";
import { isEmpty } from "ramda";
import { DAO } from "../../hooks/dao/types";
import { DAOType } from "..";

export function DAOsListPage() {
  const [wallet] = useDexContext(({ wallet }) => [wallet]);
  const daos = useDAOs();
  const isWalletPaired = wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification({
    successMessage: location.state?.createDAOSuccessMessage,
    transactionState: location.state?.transactionState,
  });

  function handleCreateADAOClicked() {
    navigate("/DAOs/create-a-DAO");
  }

  function handleLinkClick() {
    handleCreateADAOClicked();
  }

  /**
   * TODO: Merge with dex-ui-component card list once the new app patterns are established.
   */
  function CardList() {
    if (daos.isError) {
      return (
        <Text textStyle="h2_empty_or_error" margin="auto">
          Error: {daos.error?.message}
        </Text>
      );
    }

    if (daos.isLoading) {
      return (
        <SimpleGrid columns={3} spacingX="3rem" spacingY="2rem">
          {[...Array(9)].map(() => (
            <Skeleton height="88px" speed={0.4} fadeDuration={0} />
          ))}
        </SimpleGrid>
      );
    }

    if (daos.isSuccess && isEmpty(daos.data)) {
      /** TODO: Create "Not Found" layout component */
      return (
        <Box width="fit-content" margin="auto">
          <Text textStyle="h3" marginBottom="0.5rem">
            Looks like no DAOs have been created yet.
          </Text>
          <Flex alignItems="center">
            <Text textStyle="b2">Click on this link to&nbsp;</Text>
            <Link color={Color.Teal_01} onClick={handleLinkClick}>
              <Text variant="link">create the first DAO</Text>
            </Link>
          </Flex>
        </Box>
      );
    }

    return (
      <SimpleGrid columns={3} spacingX="3rem" spacingY="2rem">
        {daos.data?.map((DAO: DAO) => {
          return <DAOCard name={DAO.name} category={DAOType.GovernanceToken} />;
        })}
      </SimpleGrid>
    );
  }

  function PrimaryHeaderButton() {
    if (isWalletPaired) {
      return (
        <Button padding="0px 20px" onClick={handleCreateADAOClicked}>
          Create new DAO
        </Button>
      );
    }
    return (
      <Button variant="primary" data-testid="connect-wallet-button" onClick={wallet.connectToWallet}>
        Create new DAO
      </Button>
    );
  }

  return (
    <Page
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
          <PageHeader leftContent={[<Text textStyle="h2">DAOs</Text>]} rightContent={[<PrimaryHeaderButton />]} />
        </>
      }
      body={<CardList />}
    />
  );
}
