import { Text } from "@chakra-ui/react";
import { CardGridLayout, Page, PageHeader } from "@layouts";
import { useDAOs } from "@hooks";
import { useNavigate } from "react-router-dom";
import { PrimaryHeaderButton } from "@components";
import { DAOCard } from "./DAOCard";
import { Paths } from "@routes";
import { DAO } from "@services";

export function DAOsListPage() {
  const daos = useDAOs();
  const navigate = useNavigate();

  function handleLinkClick() {
    navigate(Paths.DAOs.Create);
  }

  return (
    <Page
      header={
        <PageHeader
          leftContent={[
            <Text textStyle="h2" key="daos">
              DAOs
            </Text>,
          ]}
          rightContent={[<PrimaryHeaderButton name="Create new DAO" route={Paths.DAOs.Create} key="create-new-dao" />]}
        />
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
            const { accountId, name, type, isPrivate, logoUrl } = dao;
            if (isPrivate) return null;
            return <DAOCard key={index} accountId={accountId} name={name} type={type} logoUrl={logoUrl} />;
          })}
        </CardGridLayout>
      }
    />
  );
}
