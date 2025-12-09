import { Divider, Flex } from "@chakra-ui/react";
import { Text, CopyTextButton, useTheme } from "@shared/ui-kit";
import { useDexContext } from "@dex/hooks";
import { useFormContext } from "react-hook-form";
import { CreateDAOUpgradeThresholdForm, CreateDAOProposalContext } from "../types";
import { useOutletContext } from "react-router-dom";

export function DAOUpgradeThresholdReviewForm() {
  const theme = useTheme();
  const { membersCount } = useOutletContext<CreateDAOProposalContext>();
  const { getValues } = useFormContext<CreateDAOUpgradeThresholdForm>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { newThreshold = 0, title, description } = getValues() ?? {};

  function handleCopyMemberId() {
    console.log("copy member id");
  }

  return (
    <Flex direction="column" gap="1.4rem">
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
      <Flex direction="row" gap="2" alignItems="center">
        <Text.P_Small_Medium color={theme.textMuted}>Threshold confirmation requirement changes to</Text.P_Small_Medium>
        <Text.P_Medium_Semibold color={theme.text}>
          {`${newThreshold} / ${membersCount} members`}
        </Text.P_Medium_Semibold>
        <Text.P_Small_Medium color={theme.textMuted}>members</Text.P_Small_Medium>
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
