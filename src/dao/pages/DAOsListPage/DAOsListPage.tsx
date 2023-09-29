import { Text } from "@chakra-ui/react";
import { CardGridLayout, Page, PageHeader } from "@dex/layouts";
import { useDAOs } from "@dao/hooks";
import { useNavigate } from "react-router-dom";
import { PrimaryHeaderButton } from "@dex/components";
import { DAOCard } from "./DAOCard";
import { Routes } from "@dao/routes";
import { DAO } from "@dao/services";

export function DAOsListPage() {
  const daos = useDAOs();
  const navigate = useNavigate();

  function handleLinkClick() {
    navigate(Routes.Create);
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
          rightContent={[<PrimaryHeaderButton name="Create new DAO" route={Routes.Create} key="create-new-dao" />]}
        />
      }
      body={
        <CardGridLayout<DAO[]>
          columns={{ md: 2, lg: 3 }}
          queryResult={daos}
          message={"It looks like no DAOs have been created yet."}
          preLinkText={"Click on this link to&nbsp;"}
          linkText={"create the first DAO"}
          onLinkClick={handleLinkClick}
        >
          {daos.data?.map((dao: DAO, index: number) => {
            const { accountEVMAddress, name, type, isPrivate, logoUrl } = dao;
            if (isPrivate) return null;
            return (
              <DAOCard key={index} accountEVMAddress={accountEVMAddress} name={name} type={type} logoUrl={logoUrl} />
            );
          })}
        </CardGridLayout>
      }
    />
  );
}
