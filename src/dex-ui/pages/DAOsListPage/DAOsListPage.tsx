import { Text, SimpleGrid, Box, Link, Flex, Skeleton } from "@chakra-ui/react";
import { Page, PageHeader } from "../../layouts";
import { Button, Color } from "../../../dex-ui-components";
import { DAOCard } from "./DAOCard";
import { useDexContext } from "../../hooks";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { ReactNode } from "react";

interface DAOMetaData {
  name: string;
  category: string;
  logo?: ReactNode;
}

const DAOs: DAOMetaData[] = [
  {
    name: "coastlineoutmost",
    category: "MultiSig DAO",
  },
  {
    name: "mutatemustache",
    category: "Governance Token DAO",
  },
  {
    name: "mendipmold",
    category: "NFT DAO",
  },
  {
    name: "pluckedkingdom",
    category: "MultiSig DAO",
  },
  {
    name: "terekdriving",
    category: "NFT DAO",
  },
  {
    name: "craftworksilly",
    category: "Governance Token DAO",
  },
  {
    name: "molecularpioneer",
    category: "MultiSig DAO",
  },
  {
    name: "pyxisconcerto",
    category: "MultiSig DAO",
  },
  {
    name: "mantraolympics",
    category: "Governance Token DAO",
  },
];

export function DAOsListPage() {
  const [wallet] = useDexContext(({ wallet }) => [wallet]);
  const isWalletPaired = wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;
  const isListEmpty = false;
  const isLoading = false;
  const isError = false;
  const error = { message: "error" };
  const isSuccess = true;

  /**
   * TODO: Merge with dex-ui-component card list once the new app patterns are established.
   */
  function CardList() {
    if (isError) {
      return (
        <Text textStyle="h2_empty_or_error" margin="auto">
          Error: {error?.message}
        </Text>
      );
    }

    if (isSuccess && isListEmpty) {
      /** TODO: Create "Not Found" layout component */
      return (
        <Box width="fit-content" margin="auto">
          <Text textStyle="h3" marginBottom="0.5rem">
            Looks like no DAOs have been created yet.
          </Text>
          <Flex alignItems="center">
            <Text textStyle="b2">Click on this link to&nbsp;</Text>
            <Link
              color={Color.Teal_01}
              //TODO: {...(isButton ? { onClick: handleLinkClick } : { href: linkRef, isExternal: true })}
            >
              <Text variant="link">create the first DAO</Text>
            </Link>
          </Flex>
        </Box>
      );
    }

    return (
      <SimpleGrid columns={3} spacingX="3rem" spacingY="2rem">
        {DAOs.map((DAO: DAOMetaData) => {
          if (isLoading) {
            return <Skeleton height="88px" speed={0.4} fadeDuration={0} />;
          }
          return <DAOCard name={DAO.name} category={DAO.category} logo={DAO.logo} />;
        })}
      </SimpleGrid>
    );
  }

  function PrimaryHeaderButton() {
    if (isWalletPaired) {
      return <Button padding="0px 20px">Create new DAO</Button>;
    }
    return (
      <Button variant="primary" data-testid="connect-wallet-button" onClick={wallet.connectToWallet}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <Page
      header={<PageHeader leftContent={[<Text textStyle="h2">DAOs</Text>]} rightContent={[<PrimaryHeaderButton />]} />}
      body={<CardList />}
    />
  );
}
