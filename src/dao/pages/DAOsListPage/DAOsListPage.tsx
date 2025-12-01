import { Alert, Box, Button, Flex, Heading, Input, Select, Tab, TabList, Tabs, Text, VStack } from "@chakra-ui/react";
import { CardGridLayout, NotFound, Page } from "@dex/layouts";
import { DAOTabs, useDAOs } from "@dao/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DAOCard } from "./DAOCard";
import { Routes } from "@dao/routes";
import { DAO, DAOType } from "@dao/services";
import { useDexContext } from "@dex/hooks";
import { Color, Pagination, usePagination } from "shared";
import { ChangeEvent } from "react";
import { filterDAOs } from "../utils";
import { DAOsPerPage } from "@dex/services";
import { HashConnectConnectionState } from "hashconnect/dist/types";

export function DAOsListPage() {
  const daos = useDAOs();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchText = searchParams.get("search") ?? "";
  const daoType = searchParams.get("type") ?? "";
  const isMyDAOsTabSelected = !!searchParams.get("filter");
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const currentUser = wallet.savedPairingData?.accountIds[0] ?? "";
  const navigate = useNavigate();

  const isWalletPaired = wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;

  function handleLinkClick() {
    navigate(Routes.Create);
  }

  function handleCreateDAOClick() {
    isWalletPaired ? navigate(Routes.Create) : wallet.connectToWallet();
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
      header={<></>}
      body={
        <Flex direction="column" gap={4}>
          {/* Hero Section */}
          <Box py={{ base: 8, md: 12 }} px={{ base: 6, md: 10 }} mb={4}>
            <VStack spacing={4} align="center" textAlign="center">
              <Heading
                as="h1"
                fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
                fontWeight="800"
                color={Color.Neutral._900}
                lineHeight="1.1"
              >
                Decentralized Governance
                <Text as="span" display="block" color={Color.Primary._500}>
                  On Hedera
                </Text>
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color={Color.Neutral._600} maxW="600px">
                Create, manage, and participate in DAOs. Empower your community with transparent and secure
                decision-making.
              </Text>
              <Flex gap={3} mt={2} direction={{ base: "column", sm: "row" }} width={{ base: "100%", sm: "auto" }}>
                <Button variant="primary" size="lg" onClick={handleCreateDAOClick} px={8}>
                  Create a DAO
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => document.getElementById("dao-list")?.scrollIntoView({ behavior: "smooth" })}
                  px={8}
                >
                  Explore DAOs
                </Button>
              </Flex>
            </VStack>
          </Box>

          <Box id="dao-list">
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ base: "stretch", md: "center" }}
              gap={{ base: 3, md: 4 }}
              mb={4}
            >
              <Tabs
                defaultIndex={isMyDAOsTabSelected ? 1 : 0}
                onChange={handleTabChange}
                bg="transparent"
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
              <Flex
                gap={{ base: 2, md: 3 }}
                direction={{ base: "column", sm: "row" }}
                width={{ base: "100%", md: "auto" }}
              >
                <Input
                  variant="filter"
                  value={searchText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearchTextChange(e.target.value)}
                  placeholder="Search"
                  width={{ base: "100%", sm: "200px", md: "220px" }}
                />
                <Select
                  variant="formTokenSelector"
                  width={{ base: "100%", sm: "10rem", md: "12rem" }}
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
            </Flex>
            {paginatedDAOs?.length === 0 && !daos.isLoading && (
              <NotFound message="No DAOs have been found with the filters selected" />
            )}
            <CardGridLayout<DAO[]>
              columns={{ base: 1, sm: 2, lg: 3 }}
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
            <Box mt={6}>
              <Pagination
                pageCount={pageCount}
                isPaginationVisible={isPaginationVisible}
                isPreviousButtonVisible={isPreviousButtonVisible}
                isNextButtonVisible={isNextButtonVisible}
                handlePageClick={handlePageClick}
              />
            </Box>
          </Box>
          <Flex fontSize={{ base: 13, md: 15 }}>
            <Alert borderRadius="12px">
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
