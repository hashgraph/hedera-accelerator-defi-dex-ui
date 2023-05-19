import { ArrowRightIcon } from "@chakra-ui/icons";
import { HashScanLink, HashscanData } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { Text, Flex, Divider } from "@chakra-ui/react";
import { SendTokenForm, SendTokenWizardContext } from "./types";
import { useDexContext, useToken } from "@hooks";
import { isNil, isNotNil } from "ramda";
import { ErrorLayout, LoadingSpinnerLayout, NotFound } from "@layouts";
import { useOutletContext } from "react-router-dom";

export function SendTokenReviewForm() {
  const { safeAccountId } = useOutletContext<SendTokenWizardContext>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletAccountId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { setValue, getValues } = useFormContext<SendTokenForm>();
  const formValues = getValues();
  const { tokenId, amount, recipientAccountId } = formValues;
  // TODO: move useToken hook to modal once asset dropdown is fully implemented.
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
      data: { name, symbol, decimals },
    } = token;

    setValue("decimals", Number(decimals));

    return (
      <Flex direction="column" width="100%" gap="4">
        <Flex direction="row" width="100%" justifyContent="space-between" alignItems="center">
          <Flex direction="column" alignItems="left" gap="1">
            <Text textStyle="p small medium">Sending from</Text>
            <HashScanLink id={safeAccountId} type={HashscanData.Account} />
          </Flex>
          <ArrowRightIcon />
          <Flex direction="column" alignItems="left" gap="1">
            <Text textStyle="p small medium">Recipient</Text>
            <HashScanLink id={recipientAccountId} type={HashscanData.Account} />
          </Flex>
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
            <Text textStyle="p small regular">
              {amount} {symbol}
            </Text>
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
