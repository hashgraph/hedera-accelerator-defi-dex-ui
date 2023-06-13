import { Flex, Text, Divider } from "@chakra-ui/react";
import { Color, CopyTextButton } from "@dex-ui-components";
import { useDexContext } from "@hooks";
import { useFormContext } from "react-hook-form";
import { ReplaceMemberForm, ReplaceMemberWizardContext } from "./types";
import { useOutletContext } from "react-router-dom";

export function ReplaceMemberReviewForm() {
  const { memberId } = useOutletContext<ReplaceMemberWizardContext>();
  const { getValues } = useFormContext<ReplaceMemberForm>();
  const { memberAddress, title, description } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  function handleCopyMemberId(memberAddress: string) {
    console.log("copy member id", memberAddress);
  }

  return (
    <Flex direction="column" gap="1.4rem">
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
      <Flex gap="2" alignItems="center">
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {memberId}
        </Text>
        <CopyTextButton onClick={() => handleCopyMemberId(memberId)} iconSize="17" />
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">New Member</Text>
        <Flex gap="2" alignItems="center">
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {memberAddress}
          </Text>
          <CopyTextButton onClick={() => handleCopyMemberId(memberAddress)} iconSize="17" />
        </Flex>
      </Flex>
      <Divider />
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
