import { Divider, Flex } from "@chakra-ui/react";
import { Text, CopyTextButton, useTheme } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOContractUpgradeForm, CreateDAOProposalContext } from "../types";
import { useDexContext } from "@dex/hooks";
import { Routes } from "@dao/routes";
import { useOutletContext } from "react-router-dom";

export function DAOContractUpgradeReviewForm() {
  const theme = useTheme();
  const { daoType } = useOutletContext<CreateDAOProposalContext>();
  const { getValues } = useFormContext<CreateDAOContractUpgradeForm>();
  const {
    title,
    description,
    linkToDiscussion,
    newImplementationAddress,
    oldProxyAddress,
    proxyAdmin,
    nftTokenSerialId,
  } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  function handleCopyMemberId(address: string) {
    console.log("Copy Member Address", address);
  }

  return (
    <Flex gap="1.3rem" direction="column">
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Title</Text.P_Small_Medium>
        <Text.P_Small_Regular color={theme.text}>{title}</Text.P_Small_Regular>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Description</Text.P_Small_Medium>
        <Text.P_Small_Regular color={theme.text}>{description}</Text.P_Small_Regular>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Link to Discussion</Text.P_Small_Medium>
        <Text.P_Small_Regular color={theme.text}>{linkToDiscussion}</Text.P_Small_Regular>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>New Implementation Address</Text.P_Small_Medium>
        <Text.P_Small_Regular color={theme.text}>{newImplementationAddress}</Text.P_Small_Regular>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Proxy Address</Text.P_Small_Medium>
        <Text.P_Small_Regular color={theme.text}>{oldProxyAddress}</Text.P_Small_Regular>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Proxy Admin</Text.P_Small_Medium>
        <Text.P_Small_Regular color={theme.text}>{proxyAdmin}</Text.P_Small_Regular>
      </Flex>
      <Divider borderColor={theme.border} />
      {daoType === Routes.NFT && (
        <>
          <Flex direction="column" gap="2">
            <Text.P_Small_Medium color={theme.textMuted}>Token serial number</Text.P_Small_Medium>
            <Text.P_Small_Regular color={theme.text}>{nftTokenSerialId}</Text.P_Small_Regular>
          </Flex>
          <Divider borderColor={theme.border} />
        </>
      )}
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Submitted By</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={theme.text}>{walletId}</Text.P_Small_Regular>
          <CopyTextButton onClick={() => handleCopyMemberId(walletId)} iconSize="17" />
        </Flex>
      </Flex>
    </Flex>
  );
}
