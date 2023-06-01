import { Divider, Flex, Text } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";
import { useDexContext } from "@hooks";
import { useFormContext } from "react-hook-form";
import { AddMemberForm, AddMemberWizardContext } from "./types";
import { useOutletContext } from "react-router-dom";

export function AddMemberReviewForm() {
  const { getValues } = useFormContext<AddMemberForm>();
  const { membersCount } = useOutletContext<AddMemberWizardContext>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { memberAddress, newThreshold } = getValues();

  return (
    <Flex gap="1.3rem" direction="column">
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">New Member</Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {memberAddress}
        </Text>
      </Flex>
      <Divider />
      <Flex direction="row" gap="2" alignItems="center">
        <Text textStyle="p small medium">Transaction threshold confirmation changes to</Text>
        <Text textStyle="p medium semibold">{`${newThreshold} / ${membersCount + 1} members`}</Text>
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
