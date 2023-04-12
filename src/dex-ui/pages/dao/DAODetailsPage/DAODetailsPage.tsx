import { useNavigate, useParams } from "react-router-dom";
import { MultiSigDAODashboard } from "./MultiSigDAODashboard";
import { useDAOs } from "../../../hooks";
import { LoadingSpinnerLayout, NotFound } from "../../../layouts";
import { Text, Flex } from "@chakra-ui/react";
import { Color } from "../../../../dex-ui-components";
import { Paths } from "../../../DEX";
import { isNil, isNotNil } from "ramda";
import { DAOType } from "../../../services";

export function DAODetailsPage() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "" } = useParams();
  const daosQueryResults = useDAOs(daoAccountId);
  const { error, isSuccess, isError, isLoading, data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const isNotFound = isSuccess && isNil(dao);
  const isDAOFound = isSuccess && isNotNil(dao);

  function onBackToDAOsLinkClick() {
    navigate(Paths.DAOs.default);
  }

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

  if (isNotFound) {
    return (
      <Flex width="100%" height="70vh" justifyContent="center" alignItems="center">
        <NotFound
          message={`We didn't find any data for this DAO (${daoAccountId}).`}
          preLinkText={""}
          linkText={"Click here to return to the DAOs list page."}
          onLinkClick={onBackToDAOsLinkClick}
        />
      </Flex>
    );
  }

  if (isDAOFound && dao.isPrivate) {
    return (
      <Flex width="100%" height="70vh" bg={Color.Primary_Bg} justifyContent="center" alignItems="center">
        <NotFound
          message={`This DAO is private (${daoAccountId}).`}
          preLinkText={""}
          linkText={"Click here to return to the DAOs list page."}
          onLinkClick={onBackToDAOsLinkClick}
        />
      </Flex>
    );
  }

  if (isDAOFound) {
    const { accountId, type } = dao;
    return (
      <>
        {type === DAOType.MultiSig ? (
          <MultiSigDAODashboard dao={dao} />
        ) : (
          <Flex width="100%" height="70vh" justifyContent="center" alignItems="center">
            <NotFound
              message={`The dashboard for '${type}' type DAOs is under construction (DAO ID: ${accountId}).`}
              preLinkText={""}
              linkText={"Click here to return to the DAOs list page."}
              onLinkClick={onBackToDAOsLinkClick}
            />
          </Flex>
        )}
      </>
    );
  }

  return <></>;
}
