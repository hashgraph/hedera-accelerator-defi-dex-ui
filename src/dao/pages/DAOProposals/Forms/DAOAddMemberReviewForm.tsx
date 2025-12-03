import { Divider, Flex } from "@chakra-ui/react";
import { Text, CopyTextButton, useTheme } from "@shared/ui-kit";
import { useDexContext } from "@dex/hooks";
import { useFormContext } from "react-hook-form";
import { CreateDAOMemberOperationForm, CreateDAOProposalContext } from "../types";
import { useOutletContext } from "react-router-dom";

export function DAOAddMemberReviewForm() {
  const theme = useTheme();
  const { getValues } = useFormContext<CreateDAOMemberOperationForm>();
  const { membersCount } = useOutletContext<CreateDAOProposalContext>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { memberAddress = "", newThreshold = "", title = "", description = "" } = getValues();

  function handleCopyMemberId() {
    console.log("copy member id");
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
        <Text.P_Small_Medium color={theme.textMuted}>New Member</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={theme.text}>{memberAddress}</Text.P_Small_Regular>
          <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
        </Flex>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="row" gap="2" alignItems="center">
        <Text.P_Small_Medium color={theme.textMuted}>Proposal threshold confirmation changes to</Text.P_Small_Medium>
        <Text.P_Medium_Semibold color={theme.text}>
          {`${newThreshold} / ${membersCount + 1} members`}
        </Text.P_Medium_Semibold>
      </Flex>
      <Divider borderColor={theme.border} />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium color={theme.textMuted}>Submitted By</Text.P_Small_Medium>
        <Flex gap="2" alignItems="center">
          <Text.P_Small_Regular color={theme.text}>{walletId}</Text.P_Small_Regular>
          <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
        </Flex>
      </Flex>
    </Flex>
  );
}
