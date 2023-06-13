import { Divider, Flex, Text } from "@chakra-ui/react";
import { Color, CopyTextButton } from "@dex-ui-components";
import { useDexContext } from "@hooks";
import { useFormContext } from "react-hook-form";
import { ChangeThresholdForm, ChangeThresholdWizardContext } from "./types";
import { useOutletContext } from "react-router-dom";

export function ChangeThresholdReviewForm() {
  const { membersCount } = useOutletContext<ChangeThresholdWizardContext>();
  const { getValues } = useFormContext<ChangeThresholdForm>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { newThreshold, title, description } = getValues();

  function handleCopyMemberId() {
    console.log("copy member id", walletId);
  }

  return (
    <Flex direction="column" gap="1.4rem">
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Title</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {title}
        </Text>
      </Flex>
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Description</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {description}
        </Text>
      </Flex>
      <Flex direction="row" gap="2" alignItems="center">
        <Text textStyle="p small medium">Threshold confirmation requirement changes to</Text>
        <Text textStyle="p medium semibold">{`${newThreshold} / ${membersCount} members`}</Text>
        <Text textStyle="p small medium">members</Text>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Submitted By</Text>
        <Flex gap="2" alignItems="center">
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {walletId}
          </Text>
          <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
        </Flex>
      </Flex>
    </Flex>
  );
}
