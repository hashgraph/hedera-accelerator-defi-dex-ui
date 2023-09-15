import { Divider, Flex } from "@chakra-ui/react";
import { ExternalLink, Color, CopyTextButton, Text, MarkdownRenderer } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOProposalContext, CreateDAOTextProposalForm } from "../types";
import { useDexContext } from "@dex/hooks";
import { useOutletContext } from "react-router-dom";
import { Routes } from "@dao/routes";

export function DAOTextProposalReviewForm() {
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
        <Text.P_Small_Semibold>{title}</Text.P_Small_Semibold>
        <Text.P_Small_Regular>{description}</Text.P_Small_Regular>
        <ExternalLink to={linkToDiscussion}>
          <Text.P_Small_Semibold_Link>{linkToDiscussion}</Text.P_Small_Semibold_Link>
        </ExternalLink>
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
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Submitted By</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={Color.Neutral._700}>{walletId}</Text.P_Small_Regular>
          <CopyTextButton onClick={() => handleCopyMemberId(walletId)} iconSize="17" />
        </Flex>
      </Flex>
      {!!metadata && (
        <>
          <Divider />
          <MarkdownRenderer markdown={metadata} />
        </>
      )}
    </Flex>
  );
}
