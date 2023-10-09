import { Box, Button, Divider, Flex, SimpleGrid, Tooltip } from "@chakra-ui/react";
import { Text, Color, HashScanLink, HashscanData, MetricLabel, AlertDialog } from "@shared/ui-kit";
import * as R from "ramda";
import { useNavigate, useOutletContext } from "react-router-dom";
import { HBARTokenId, HBARTokenSymbol, HBARSymbol } from "@dex/services";
import { DAODetailsContext, DAOType, GovernanceDAODetails, MultiSigDAODetails, NFTDAODetails } from "@dao/services";
import { TokenType, TransactionResponse } from "@hashgraph/sdk";
import { Routes } from "@dao/routes";
import { DepositTokensFormData, DepositTokensModal } from "./DepositTokensModal";
import { useState } from "react";
import { useHandleTransactionSuccess, usePairedWalletDetails } from "@dex/hooks";
import { useFetchContract, useDepositTokens } from "@dao/hooks";

export function AssetsList() {
  const { tokenBalances: assets, dao } = useOutletContext<DAODetailsContext>();
  const { safeEVMAddress = "" } = dao as MultiSigDAODetails;
  const { assetsHolderAddress } = dao as GovernanceDAODetails | NFTDAODetails;
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const { isWalletPaired } = usePairedWalletDetails();
  // change to token id match
  const hbarIndex = assets?.findIndex((asset) => asset.name === HBARTokenSymbol);
  assets[hbarIndex] = { ...assets[hbarIndex], tokenId: HBARTokenId };
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const assetsWithHBARFirst: Asset[] = R.swap(0, hbarIndex, assets);
  const navigate = useNavigate();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const depositTokens = useDepositTokens(handleDepositTokensSuccess);
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress);
  const daoSafeId = daoSafeIdQueryResults.data?.data.contract_id ?? "";
  const daoAssetHolderQueryResults = useFetchContract(assetsHolderAddress ?? "");
  const daoAssetHolder = daoAssetHolderQueryResults.data?.data.contract_id ?? "";

  const tokenTransferAccountId = dao.type === DAOType.MultiSig ? daoSafeId : daoAssetHolder;

  async function handleDepositClicked(data: DepositTokensFormData) {
    const selectedToken = assets.find((token) => token.tokenId === data.tokenId);
    if (!selectedToken) {
      return;
    }
    depositTokens.mutate({
      ...data,
      safeId: tokenTransferAccountId,
      decimals: Number(selectedToken.decimals),
      amount: Number(data.amount),
      isNFT: !!selectedToken.isNFT,
    });
  }

  function handleDepositTokensSuccess(transactionResponse: TransactionResponse) {
    const message = "Successfully deposited tokens to safe";
    handleTransactionSuccess(transactionResponse, message);
    setDepositDialogOpen(false);
  }

  return (
    <>
      <Flex layerStyle="dao-dashboard__content-header" justifyContent="space-between">
        <Text.P_Medium_Medium>Total Assets: {assets.length}</Text.P_Medium_Medium>
        <Flex>
          <AlertDialog
            openDialogButtonStyles={{ flex: "1" }}
            openDialogButtonText="Deposit"
            title="Deposit Assets"
            dialogWidth="30rem"
            body={
              <DepositTokensModal
                safeId={tokenTransferAccountId}
                handleDepositClicked={handleDepositClicked}
                handleCancelClicked={() => {
                  setDepositDialogOpen(false);
                }}
                handleAssociateTokenClicked={() => {
                  navigate(`../${Routes.CreateDAOProposal}/${Routes.DAOTokenAssociateDetails}`);
                }}
              />
            }
            isOpenDialogButtonDisabled={!isWalletPaired}
            alertDialogOpen={depositDialogOpen}
            onAlertDialogOpen={() => setDepositDialogOpen(true)}
            onAlertDialogClose={() => setDepositDialogOpen(false)}
          />
        </Flex>
      </Flex>
      <Flex direction="row" layerStyle="dao-dashboard__content-body">
        <SimpleGrid minWidth="100%" columns={2} spacing="1rem">
          {assetsWithHBARFirst.map((asset) => {
            const { name, tokenId, balance, symbol, isNFT } = asset;
            return (
              <Flex
                key={tokenId}
                direction="column"
                bg={Color.White_02}
                justifyContent="space-between"
                height="150px"
                border={`1px solid ${Color.Neutral._200}`}
                borderRadius="4px"
                padding="1.5rem"
              >
                <Flex direction="row" justifyContent="space-between" gap="2">
                  <Text.P_Medium_Semibold>{name}</Text.P_Medium_Semibold>
                  <Flex gap="2">
                    {symbol !== HBARSymbol ? <HashScanLink id={tokenId} type={HashscanData.Token} /> : null}
                    <Tooltip
                      label={"Token balance must be greater than 0 to create a Token Transfer proposal."}
                      isDisabled={!!balance}
                      placement="bottom"
                    >
                      <Button
                        variant="primary"
                        isDisabled={!balance || !isWalletPaired}
                        onClick={() => {
                          navigate(`../${Routes.CreateDAOProposal}/${Routes.DAOTokenTransferDetails}`, {
                            state: {
                              tokenId: tokenId,
                              tokenType: isNFT
                                ? TokenType.NonFungibleUnique.toString()
                                : TokenType.FungibleCommon.toString(),
                            },
                          });
                        }}
                      >
                        Send
                      </Button>
                    </Tooltip>
                  </Flex>
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
