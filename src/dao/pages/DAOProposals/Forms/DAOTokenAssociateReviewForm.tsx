import { Text, Color, HashScanLink, HashscanData } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { Flex, Divider } from "@chakra-ui/react";
import { CreateDAOTokenAssociateForm, CreateDAOProposalContext } from "../types";
import { useDexContext, useToken } from "@dex/hooks";
import { isNil, isNotNil } from "ramda";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@dex/layouts";
import { useOutletContext } from "react-router-dom";
import { Routes } from "@dao/routes";

export function DAOTokenAssociateReviewForm() {
  const { safeAccountId, daoType } = useOutletContext<CreateDAOProposalContext>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletAccountId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { getValues } = useFormContext<CreateDAOTokenAssociateForm>();
  const { tokenId, title, description, linkToDiscussion, nftTokenSerialId } = getValues() ?? {};
  const { error, isSuccess, isError, isLoading, data: token } = useToken(tokenId);
  const isNotFound = isSuccess && isNil(token);
  const isTokenFound = isSuccess && isNotNil(token);

  if (isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (isNotFound) {
    return (
      <Flex width="100%" height="70vh" justifyContent="center" alignItems="center">
        <NotFound message={`We didn't find any data for token (${tokenId}).`} />
      </Flex>
    );
  }

  if (isTokenFound) {
    const {
      data: { name },
    } = token;
    return (
      <Flex direction="column" width="100%" gap="4">
        <Flex direction="column" gap="2">
          <Text.P_Small_Medium>Title</Text.P_Small_Medium>
          <Text.P_Small_Regular color={Color.Neutral._700}>{title}</Text.P_Small_Regular>
        </Flex>
        <Divider />
        <Flex direction="column" gap="2">
          <Text.P_Small_Medium>Description</Text.P_Small_Medium>
          <Text.P_Small_Regular color={Color.Neutral._700}>{description}</Text.P_Small_Regular>
        </Flex>
        <Divider />
        <Flex direction="column" gap="2">
          <Text.P_Small_Medium>Link to Discussion</Text.P_Small_Medium>
          <Text.P_Small_Regular color={Color.Neutral._700}>{linkToDiscussion}</Text.P_Small_Regular>
        </Flex>
        <Divider />
        <Flex direction="column" alignItems="left" gap="1">
          <Text.P_Small_Medium>Associating To</Text.P_Small_Medium>
          <HashScanLink id={safeAccountId} type={HashscanData.Account} />
        </Flex>
        <Divider />
        <Flex direction="column" alignItems="left" gap="1">
          <Text.P_Small_Medium>Token</Text.P_Small_Medium>
          <Flex direction="row" justifyContent="space-between" gap="1">
            <Flex direction="row" gap="1" alignItems="center">
              <Text.P_Small_Regular>{name}</Text.P_Small_Regular>
              {"-"}
              <HashScanLink id={tokenId} type={HashscanData.Token} />
            </Flex>
          </Flex>
        </Flex>
        <Divider />
        {daoType === Routes.NFT && (
          <>
            <Flex direction="column" gap="2">
              <Text.P_Small_Medium>Token serial number</Text.P_Small_Medium>
              <Text.P_Small_Regular color={Color.Neutral._700}>{nftTokenSerialId}</Text.P_Small_Regular>
            </Flex>
            <Divider />
          </>
        )}
        <Flex direction="column" alignItems="left" gap="1">
          <Text.P_Small_Medium>Created by</Text.P_Small_Medium>
          <HashScanLink id={walletAccountId} type={HashscanData.Account} />
        </Flex>
      </Flex>
    );
  }
  return <></>;
}
