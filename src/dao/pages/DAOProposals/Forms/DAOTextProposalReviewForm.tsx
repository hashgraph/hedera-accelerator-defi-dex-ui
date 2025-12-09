import { Divider, Flex } from "@chakra-ui/react";
import { ExternalLink, CopyTextButton, Text, MarkdownRenderer, useTheme } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOProposalContext, CreateDAOTextProposalForm } from "../types";
import { useDexContext } from "@dex/hooks";
import { useOutletContext } from "react-router-dom";
import { Routes } from "@dao/routes";

export function DAOTextProposalReviewForm() {
  const theme = useTheme();
  const { daoType } = useOutletContext<CreateDAOProposalContext>();
  const { getValues } = useFormContext<CreateDAOTextProposalForm>();
  const { title, description, linkToDiscussion, nftTokenSerialId, metadata } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  function handleCopyMemberId(address: string) {
    console.log("Copy Member Address", address);
  }

  return (
    <Flex gap="1.3rem" direction="column">
      <Flex direction="column" gap="2">
        <Text.P_Small_Semibold color={theme.text}>{title}</Text.P_Small_Semibold>
        <Text.P_Small_Regular color={theme.text}>{description}</Text.P_Small_Regular>
        <ExternalLink to={linkToDiscussion}>
          <Text.P_Small_Semibold_Link>{linkToDiscussion}</Text.P_Small_Semibold_Link>
        </ExternalLink>
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
      {!!metadata && (
        <>
          <Divider borderColor={theme.border} />
          <MarkdownRenderer markdown={metadata} />
        </>
      )}
    </Flex>
  );
}
