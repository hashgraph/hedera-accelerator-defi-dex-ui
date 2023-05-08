import { Flex } from "@chakra-ui/react";
import { FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { ReplaceMemberForm } from "./types";

interface ReplaceMemberDetailsFormProps {
  memberId: string;
}

export function ReplaceMemberDetailsForm(props: ReplaceMemberDetailsFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ReplaceMemberForm>();
  const { memberId } = props;
  return (
    <DAOFormContainer>
      <Flex direction="column" gap="5">
        <FormInput<"oldMember">
          inputProps={{
            id: "oldMember",
            label: "Member To be replaced",
            isReadOnly: true,
            value: memberId,
            type: "text",
          }}
        />
        <FormInput<"memberAddress">
          inputProps={{
            id: "memberAddress",
            label: "New Member",
            type: "text",
            placeholder: "Enter Member Address",
            register: {
              ...register("memberAddress", {
                required: { value: true, message: "A member address is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.memberAddress)}
          errorMessage={errors.memberAddress && errors.memberAddress.message}
        />
      </Flex>
    </DAOFormContainer>
  );
}
