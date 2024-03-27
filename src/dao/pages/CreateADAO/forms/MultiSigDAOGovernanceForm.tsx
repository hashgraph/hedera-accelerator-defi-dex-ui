import { useFieldArray, useFormContext } from "react-hook-form";
import { CancelledStepIcon, CheckCircleIcon, Color, FormInput, FormInputList } from "@shared/ui-kit";
import { CreateAMultiSigDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { checkForValidAccountId } from "@dex/utils";
import { debounce } from "ts-debounce";
import { DEBOUNCE_TIME } from "@dex/services";

export function MultiSigDAOGovernanceForm() {
  const {
    control,
    register,
    trigger,
    formState: { errors, isValid },
  } = useFormContext<CreateAMultiSigDAOForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "governance.owners",
  });

  function getAdminAddressStatusIcon() {
    if (errors.governance?.admin) return <CancelledStepIcon boxSize="5" color={Color.Destructive._500} />;
    if (isValid) return <CheckCircleIcon color={Color.Success._500} boxSize={7} />;
    return "";
  }

  function handleAdminAddressChange(_event: any) {
    trigger("governance.admin");
  }

  return (
    <DAOFormContainer>
      <FormInput<"governance.admin">
        inputProps={{
          id: "governance.admin",
          label: "Admin account id (wallet address)",
          type: "text",
          placeholder: "Enter account id",
          unit: getAdminAddressStatusIcon(),
          register: {
            ...register("governance.admin", {
              required: { value: true, message: "Admin account id (wallet address) is required." },
              validate: (value) => checkForValidAccountId(value) || "Invalid account, please, enter a different one.",
              onChange: debounce(handleAdminAddressChange, DEBOUNCE_TIME),
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
        fieldLabel="Member account (wallet address)"
        fieldPlaceholder="Enter member account"
        fieldButtonText="+ Add Member"
        append={append}
        remove={remove}
        register={register}
      />
    </DAOFormContainer>
  );
}
