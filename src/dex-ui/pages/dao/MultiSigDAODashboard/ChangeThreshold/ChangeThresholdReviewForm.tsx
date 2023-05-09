import { Divider, Flex, Text } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";
import { useDexContext } from "@dex-ui/hooks";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "../../CreateADAO/forms/DAOFormContainer";
import { Member } from "../types";
import { ChangeThresholdForm } from "./types";

interface ChangeThresholdReviewFormProps {
  members: Member[];
}

export function ChangeThresholdReviewForm(props: ChangeThresholdReviewFormProps) {
  const { members } = props;
  const { getValues } = useFormContext<ChangeThresholdForm>();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const { newThreshold } = getValues();

  return (
    <DAOFormContainer>
      <Flex direction="column" gap="6" width="100%">
        <Flex direction="row" gap="2" alignItems="center">
          <Text textStyle="p small medium">Threshold confirmation requirement changes to</Text>
          <Text textStyle="p medium semibold">{`${newThreshold} / ${members.length} members`}</Text>
          <Text textStyle="p small medium">members</Text>
        </Flex>
        <Divider />
        <Flex direction="column" gap="2">
          <Text textStyle="p small medium">Submitted By</Text>
          <Text textStyle="p small regular" color={Color.Neutral._700}>
            {walletId}
          </Text>
        </Flex>
      </Flex>
    </DAOFormContainer>
  );
}
