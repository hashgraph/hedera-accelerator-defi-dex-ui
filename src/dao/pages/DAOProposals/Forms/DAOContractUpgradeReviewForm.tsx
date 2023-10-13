import { Divider, Flex } from "@chakra-ui/react";
import { Text, Color, CopyTextButton } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOContractUpgradeForm, CreateDAOProposalContext } from "../types";
import { useDexContext } from "@dex/hooks";
import { Routes } from "@dao/routes";
import { useOutletContext } from "react-router-dom";

export function DAOContractUpgradeReviewForm() {
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
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>New Implementation Address</Text.P_Small_Medium>
        <Text.P_Small_Regular color={Color.Neutral._700}>{newImplementationAddress}</Text.P_Small_Regular>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Proxy Address</Text.P_Small_Medium>
        <Text.P_Small_Regular color={Color.Neutral._700}>{oldProxyAddress}</Text.P_Small_Regular>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Proxy Admin</Text.P_Small_Medium>
        <Text.P_Small_Regular color={Color.Neutral._700}>{proxyAdmin}</Text.P_Small_Regular>
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
    </Flex>
  );
}
