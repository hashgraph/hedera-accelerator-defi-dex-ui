import { Divider, Flex } from "@chakra-ui/react";
import { Text, Color, CopyTextButton } from "@shared/ui-kit";
import { useDexContext } from "@dex/hooks";
import { useFormContext } from "react-hook-form";
import { CreateDAOUpgradeThresholdForm, CreateDAOProposalContext } from "../types";
import { useOutletContext } from "react-router-dom";

export function DAOUpgradeThresholdReviewForm() {
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
        <Text.P_Small_Medium>Title</Text.P_Small_Medium>
        <Text.P_Small_Regular color={Color.Neutral._700}>{title}</Text.P_Small_Regular>
      </Flex>
      <Divider />
      <Flex direction="column" gap="2">
        <Text.P_Small_Medium>Description</Text.P_Small_Medium>
        <Text.P_Small_Regular color={Color.Neutral._700}>{description}</Text.P_Small_Regular>
      </Flex>
      <Divider />
      <Flex direction="row" gap="2" alignItems="center">
        <Text.P_Small_Medium>Threshold confirmation requirement changes to</Text.P_Small_Medium>
        <Text.P_Medium_Semibold>{`${newThreshold} / ${membersCount} members`}</Text.P_Medium_Semibold>
        <Text.P_Small_Medium>members</Text.P_Small_Medium>
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
