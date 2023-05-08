import { Flex, Text, Divider } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";
import { useDexContext } from "@dex-ui/hooks";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { MemberUpdateForm, ReplaceMemberForm } from "./types";

interface ReplaceMemberDetailsFormProps {
  memberId: string;
}

export function ReplaceMemberReviewForm(props: ReplaceMemberDetailsFormProps) {
  const { memberId } = props;
  const { getValues } = useFormContext<MemberUpdateForm>();
  const { memberAddress } = getValues() as ReplaceMemberForm;
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  return (
    <DAOFormContainer>
      <Flex direction="column" gap="6" width="100%">
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
    </DAOFormContainer>
  );
}
