import { Flex, Text, Divider } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";
import { useDexContext } from "@hooks";
import { useFormContext } from "react-hook-form";
import { ReplaceMemberForm, ReplaceMemberWizardContext } from "./types";
import { useOutletContext } from "react-router-dom";

export function ReplaceMemberReviewForm() {
  const { memberId } = useOutletContext<ReplaceMemberWizardContext>();
  const { getValues } = useFormContext<ReplaceMemberForm>();
  const { memberAddress } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  return (
    <Flex direction="column" gap="1.4rem">
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Member to be replaced</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {memberId}
        </Text>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">New Member</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {memberAddress}
        </Text>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">Submitted By</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {walletId}
        </Text>
      </Flex>
    </Flex>
  );
}
