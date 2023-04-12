import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInput, FormInputList } from "../../../../../dex-ui-components";
import { CreateAMultiSigDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";

export function MultiSigDAOGovernanceForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateAMultiSigDAOForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "governance.owners",
  });

  return (
    <DAOFormContainer>
      <FormInput<"governance.admin">
        inputProps={{
          id: "governance.admin",
          label: "Admin wallet address",
          type: "text",
          placeholder: "Enter address",
          register: {
            ...register("governance.admin", {
              required: { value: true, message: "An admin wallet address is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors.governance?.admin)}
        errorMessage={errors.governance?.admin?.message}
      />
      <FormInputList<CreateAMultiSigDAOForm, "governance.owners">
        fields={fields}
        defaultFieldValue={{ value: "" }}
        formPath="governance.owners"
        append={append}
        remove={remove}
        register={register}
      />
    </DAOFormContainer>
  );
}
