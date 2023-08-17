import { Color, HashScanLink, HashscanData } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { Text, Flex, Divider } from "@chakra-ui/react";
import { CreateDAOTokenAssociateForm, CreateDAOProposalContext } from "../types";
import { useDexContext, useToken } from "@dex/hooks";
import { isNil, isNotNil } from "ramda";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@dex/layouts";
import { useOutletContext } from "react-router-dom";

export function DAOTokenAssociateReviewForm() {
  const { safeAccountId } = useOutletContext<CreateDAOProposalContext>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletAccountId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { getValues } = useFormContext<CreateDAOTokenAssociateForm>();
  const { tokenId, title, description, linkToDiscussion } = getValues() ?? {};
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
          <Text textStyle="p small medium">Title</Text>
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {title}
          </Text>
        </Flex>
        <Divider />
        <Flex direction="column" gap="2">
          <Text textStyle="p small medium">Description</Text>
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {description}
          </Text>
        </Flex>
        <Divider />
        <Flex direction="column" gap="2">
          <Text textStyle="p small medium">Link to Discussion</Text>
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {linkToDiscussion}
          </Text>
        </Flex>
        <Divider />
        <Flex direction="column" alignItems="left" gap="1">
          <Text textStyle="p small medium">Associating To</Text>
          <HashScanLink id={safeAccountId} type={HashscanData.Account} />
        </Flex>
        <Divider />
        <Flex direction="column" alignItems="left" gap="1">
          <Text textStyle="p small medium">Token</Text>
          <Flex direction="row" justifyContent="space-between" gap="1">
            <Flex direction="row" gap="1" alignItems="center">
              <Text textStyle="p small regular">{name}</Text>
              {"-"}
              <HashScanLink id={tokenId} type={HashscanData.Token} />
            </Flex>
          </Flex>
        </Flex>
        <Divider />
        <Flex direction="column" alignItems="left" gap="1">
          <Text textStyle="p small medium">Created by</Text>
          <HashScanLink id={walletAccountId} type={HashscanData.Account} />
        </Flex>
      </Flex>
    );
  }
  return <></>;
}
