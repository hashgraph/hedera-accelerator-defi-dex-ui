import { Text, Box, Center } from "@chakra-ui/react";
import { CardGridLayout, Page, PageHeader } from "@layouts";
import { Notification, useNotification, NotficationTypes } from "@dex-ui-components/base";
import { useDAOs } from "@hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryHeaderButton } from "@components";
import { DAOCard } from "./DAOCard";
import { Paths } from "@routes";
import { DAO } from "@services";

export function DAOsListPage() {
  const daos = useDAOs();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification({
    successMessage: location.state?.createDAOSuccessMessage,
    transactionState: location.state?.transactionState,
  });

  function handleLinkClick() {
    navigate(Paths.DAOs.Create);
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
          <PageHeader
            leftContent={[<Text textStyle="h2">DAOs</Text>]}
            rightContent={[<PrimaryHeaderButton name="Create new DAO" route={Paths.DAOs.Create} />]}
          />
        </>
      }
      body={
        <CardGridLayout<DAO[]>
          columns={3}
          spacingX="3rem"
          spacingY="2rem"
          queryResult={daos}
          message={"It looks like no DAOs have been created yet."}
          preLinkText={"Click on this link to&nbsp;"}
          linkText={"create the first DAO"}
          onLinkClick={handleLinkClick}
        >
          {daos.data?.map((dao: DAO, index: number) => {
            const { accountId, name, type, isPrivate } = dao;
            if (isPrivate) return null;
            return <DAOCard key={index} accountId={accountId} name={name} type={type} />;
          })}
        </CardGridLayout>
      }
    />
  );
}
