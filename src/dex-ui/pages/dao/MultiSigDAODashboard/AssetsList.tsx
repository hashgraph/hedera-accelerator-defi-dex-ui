import { Button, Box, Divider, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { Color, HashScanLink, HashscanData, MetricLabel } from "@dex-ui-components";
import * as R from "ramda";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { Paths } from "@routes";
import { TokenTransferLocationState } from "@pages";
import { HBARTokenSymbol } from "@services";

const { absolute: AbsolutePath, Multisig, DAOTokenTransferDetails } = Paths.DAOs;

export function AssetsList() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "" } = useParams();
  const { tokenBalances: assets, totalAssetValue } = useOutletContext<MultiSigDAODetailsContext>();
  // change to token id match
  const hbarIndex = assets?.findIndex((asset) => asset.name === HBARTokenSymbol);
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const assetsWithHBARFirst: Asset[] = R.swap(0, hbarIndex, assets);

  function handleSendTokenClicked(tokenId: string) {
    navigate(`${AbsolutePath}/${Multisig}/${daoAccountId}/new-proposal/${DAOTokenTransferDetails}`, {
      state: { tokenId },
    } as TokenTransferLocationState);
  }

  return (
    <>
      <Flex layerStyle="dao-dashboard__content-header">
        <Text textStyle="p medium medium">Total Value: {totalAssetValue} USD</Text>
      </Flex>
      <Flex direction="row" layerStyle="dao-dashboard__content-body">
        <SimpleGrid minWidth="100%" columns={2} spacingX="2rem" spacingY="2rem">
          {assetsWithHBARFirst.map((asset, index) => {
            const { name, tokenId, balance, symbol, value } = asset;
            return (
              <Flex
                key={index}
                direction="column"
                bg={Color.White_02}
                justifyContent="space-between"
                height="177px"
                border={`1px solid ${Color.Neutral._200}`}
                borderRadius="4px"
                padding="1.5rem"
              >
                <Flex direction="row" justifyContent="space-between" gap="2">
                  <Box flexGrow="2">
                    <Text textStyle="p medium semibold">{name}</Text>
                    <HashScanLink id={tokenId} type={HashscanData.Token} />
                  </Box>

                  <Button isDisabled={name === HBARTokenSymbol} onClick={() => handleSendTokenClicked(tokenId)}>
                    Send
                  </Button>
                </Flex>
                <Divider />
                <Flex direction="row" justifyContent="space-between">
                  <Box flex="1">
                    <MetricLabel label="BALANCE" value={`${balance} ${symbol}`} />
                  </Box>
                  <Box flex="1">
                    <MetricLabel label="VALUE" value={value} />
                  </Box>
                </Flex>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Flex>
    </>
  );
}
