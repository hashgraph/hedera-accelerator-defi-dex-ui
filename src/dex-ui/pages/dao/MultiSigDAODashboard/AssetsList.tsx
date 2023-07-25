import { Box, Button, Divider, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { Color, HashScanLink, HashscanData, MetricLabel } from "@dex-ui-components";
import * as R from "ramda";
import { useNavigate, useOutletContext } from "react-router-dom";
import { MultiSigDAODetailsContext } from "./types";
import { HBARTokenSymbol } from "@services";
import { Paths } from "@dex-ui/routes";

export function AssetsList() {
  const { tokenBalances: assets } = useOutletContext<MultiSigDAODetailsContext>();
  // change to token id match
  const hbarIndex = assets?.findIndex((asset) => asset.name === HBARTokenSymbol);
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const assetsWithHBARFirst: Asset[] = R.swap(0, hbarIndex, assets);
  const navigate = useNavigate();

  return (
    <>
      <Flex layerStyle="dao-dashboard__content-header">
        <Text textStyle="p medium medium">Total Assets: {assets.length}</Text>
      </Flex>
      <Flex direction="row" layerStyle="dao-dashboard__content-body">
        <SimpleGrid minWidth="100%" columns={2} spacing="1rem">
          {assetsWithHBARFirst.map((asset, index) => {
            const { name, tokenId, balance, symbol } = asset;
            return (
              <Flex
                key={index}
                direction="column"
                bg={Color.White_02}
                justifyContent="space-between"
                height="150px"
                border={`1px solid ${Color.Neutral._200}`}
                borderRadius="4px"
                padding="1.5rem"
              >
                <Flex direction="row" justifyContent="space-between" gap="2">
                  <Text textStyle="p medium semibold">{name}</Text>
                  {tokenId && (
                    <Flex gap="2">
                      <HashScanLink id={tokenId} type={HashscanData.Token} />
                      <Button
                        variant="primary"
                        isDisabled={!balance}
                        onClick={() => {
                          navigate(`../${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTokenTransferDetails}`, {
                            state: {
                              tokenId: tokenId,
                            },
                          });
                        }}
                      >
                        Send
                      </Button>
                    </Flex>
                  )}
                </Flex>
                <Divider />
                <Flex direction="row" justifyContent="space-between">
                  <Box>
                    <MetricLabel label="BALANCE" value={`${balance} ${symbol}`} />
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
