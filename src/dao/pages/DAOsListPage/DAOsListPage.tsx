import { Alert, Box, Flex, Input, Select, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import { CardGridLayout, NotFound, Page, PageHeader } from "@dex/layouts";
import { DAOTabs, useDAOs } from "@dao/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryHeaderButton } from "@dex/components";
import { DAOCard } from "./DAOCard";
import { Routes } from "@dao/routes";
import { DAO, DAOType } from "@dao/services";
import { useDexContext } from "@dex/hooks";
import { Color, Pagination, usePagination } from "shared";
import { ChangeEvent } from "react";
import { filterDAOs } from "../utils";
import { DAOsPerPage } from "@dex/services";
import { isMobile } from "react-device-detect";

export function DAOsListPage() {
  const daos = useDAOs();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") ?? "";
  const daoType = searchParams.get("type") ?? "";
  const isMyDAOsTabSelected = !!searchParams.get("filter") ?? false;
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const currentUser = wallet.savedPairingData?.accountIds[0] ?? "";
  const navigate = useNavigate();

  function handleLinkClick() {
    navigate(Routes.Create);
  }

  function handleSearchTextChange(searchText: string) {
    searchText ? searchParams.set("search", searchText) : searchParams.delete("search");
    setSearchParams(searchParams);
  }

  function handleDAOTypeChange(daoType: string) {
    daoType ? searchParams.set("type", daoType) : searchParams.delete("type");
    setSearchParams(searchParams);
  }

  const handleTabChange = (tabIndex: number) => {
    tabIndex === 1 ? searchParams.set("filter", "myDAOs") : searchParams.delete("filter");
    setSearchParams(searchParams);
  };

  const filteredDAOs = filterDAOs(daos.data ?? [], {
    searchText,
    type: daoType,
    isMyDAOsTabSelected,
    currentUser,
  });
  const {
    paginatedData: paginatedDAOs,
    pageCount,
    isPaginationVisible,
    isPreviousButtonVisible,
    isNextButtonVisible,
    handlePageClick,
  } = usePagination<DAO>({ data: filteredDAOs ?? [], pageLimit: DAOsPerPage });

  return (
    <Page
      header={
        <PageHeader
          leftContent={[
            <Text textStyle="h2" key="daos">
              DAOs
            </Text>,
          ]}
          rightContent={
            isMobile ? [] : [<PrimaryHeaderButton name="Create new DAO" route={Routes.Create} key="create-new-dao" />]
          }
        />
      }
      body={
        <Flex direction="column" gap={4}>
          <Tabs
            defaultIndex={isMyDAOsTabSelected ? 1 : 0}
            onChange={handleTabChange}
            bg={Color.White}
            variant="dao-dashboard-tab"
          >
            <TabList borderBottom="0">
              <Tab>
                <Box>{DAOTabs.All}</Box>
              </Tab>
              <Tab>
                <Box>{DAOTabs.MyDAOs}</Box>
              </Tab>
            </TabList>
          </Tabs>
          <Flex justifyContent="flex-end" gap={4}>
            <Input
              variant="filter"
              value={searchText}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearchTextChange(e.target.value)}
              placeholder="Search"
              width="fit-content"
              minWidth="unset"
            />
            <Select
              variant="formTokenSelector"
              width="12rem"
              placeholder="All"
              value={daoType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleDAOTypeChange(e.target.value)}
            >
              {Object.values(DAOType).map((option) => {
                return (
                  <option key={option} value={option}>
                    {option}
                  </option>
                );
              })}
            </Select>
          </Flex>
          {paginatedDAOs?.length === 0 && !daos.isLoading && (
            <NotFound message="No DAOs have been found with the filters selected" />
          )}
          <CardGridLayout<DAO[]>
            columns={{ md: 2, lg: 3 }}
            queryResult={daos}
            message={"It looks like no DAOs have been created yet."}
            preLinkText={"Click on this link to"}
            linkText={"create the first DAO"}
            onLinkClick={handleLinkClick}
          >
            {paginatedDAOs?.map((dao: DAO, index: number) => {
              const { accountEVMAddress, name, type, isPrivate, logoUrl } = dao;
              /*
              if (isPrivate) {
                <DAOCard key={index} accountEVMAddress={accountEVMAddress} name={name} type={type} logoUrl={logoUrl}
                isPrivate={isPrivate} />
              }
                //return null;

 */
              return (
                <DAOCard
                  key={index}
                  accountEVMAddress={accountEVMAddress}
                  name={name}
                  type={type}
                  logoUrl={logoUrl}
                  isPrivate={isPrivate}
                />
              );
            })}
          </CardGridLayout>
          <Pagination
            pageCount={pageCount}
            isPaginationVisible={isPaginationVisible}
            isPreviousButtonVisible={isPreviousButtonVisible}
            isNextButtonVisible={isNextButtonVisible}
            handlePageClick={handlePageClick}
          />
          <Flex fontSize={15}>
            <Alert>
              <p>
                <strong>Caution</strong>: DAOs listed above are created and named by the DAO creators.
                <br />
                <strong>Please exercise caution and be aware of scammers and impersonators</strong>. We do not verify,
                control, curate, endorse or adopt any Third-Party Content on this site, including the DAOs shown here,
                and have no responsibility or liability for them.
              </p>
            </Alert>
          </Flex>
        </Flex>
      }
    />
  );
}
