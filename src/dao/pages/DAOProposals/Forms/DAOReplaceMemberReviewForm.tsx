import { Flex, Divider } from "@chakra-ui/react";
import { Text, Color, CopyTextButton } from "@shared/ui-kit";
import { useDexContext } from "@dex/hooks";
import { useFormContext } from "react-hook-form";
import { CreateDAOMemberOperationForm } from "../types";

export function DAOReplaceMemberReviewForm() {
  const { getValues } = useFormContext<CreateDAOMemberOperationForm>();
  const { memberAddress = "", newMemberAddress = "", title = "", description = "" } = getValues() ?? {};
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  function handleCopyMemberId() {
    console.log("copy member id");
  }

  return (
    <Flex direction="column" gap="1.4rem">
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
        <Text.P_Small_Medium>Member to be replaced</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={Color.Neutral._700}>{memberAddress}</Text.P_Small_Regular>
          <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
        </Flex>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>New Member</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={Color.Neutral._700}>{newMemberAddress}</Text.P_Small_Regular>
          <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
        </Flex>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Submitted By</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={Color.Neutral._700}>{walletId}</Text.P_Small_Regular>
          <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
        </Flex>
      </Flex>
    </Flex>
  );
}
