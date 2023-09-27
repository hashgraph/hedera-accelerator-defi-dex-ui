import { Divider, Flex, Text } from "@chakra-ui/react";
import { Color, CopyTextButton } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOContractUpgradeForm, CreateDAOProposalContext } from "../types";
import { useDexContext } from "@dex/hooks";
import { Routes } from "@dao/routes";
import { useOutletContext } from "react-router-dom";

export function DAOContractUpgradeReviewForm() {
  const { daoType } = useOutletContext<CreateDAOProposalContext>();
  const { getValues } = useFormContext<CreateDAOContractUpgradeForm>();
  const { title, description, linkToDiscussion, newImplementationAddress, oldProxyAddress, nftTokenSerialId } =
    getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  function handleCopyMemberId(address: string) {
    console.log("Copy Member Address", address);
  }

  return (
    <Flex gap="1.3rem" direction="column">
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
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">New Implementation Address</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {newImplementationAddress}
        </Text>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Proxy Address</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {oldProxyAddress}
        </Text>
      </Flex>
      <Divider />
      {daoType === Routes.NFT && (
        <>
          <Flex direction="column" gap="2">
            <Text textStyle="p small medium">Token serial number</Text>
            <Text textStyle="p small regular" color={Color.Neutral._700}>
              {nftTokenSerialId}
            </Text>
          </Flex>
          <Divider />
        </>
      )}
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Submitted By</Text>
        <Flex gap="2" alignItems="center">
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {walletId}
          </Text>
          <CopyTextButton onClick={() => handleCopyMemberId(walletId)} iconSize="17" />
        </Flex>
      </Flex>
    </Flex>
  );
}
