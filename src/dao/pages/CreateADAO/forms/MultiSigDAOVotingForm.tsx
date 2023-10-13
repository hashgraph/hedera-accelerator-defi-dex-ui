import { useFormContext } from "react-hook-form";
import { FormInput } from "@shared/ui-kit";
import { CreateAMultiSigDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { DAOToolTips } from "./constants";

export function MultiSigDAOVotingForm() {
  const {
    getValues,
    register,
    formState: { errors },
  } = useFormContext<CreateAMultiSigDAOForm>();
  const { governance } = getValues();
  const { admin, owners } = governance ?? { admin: "", owners: [] };
  const adminCount = admin?.length > 0 ? 1 : 0;
  const maxThreshold = (owners?.length ?? 0) + adminCount;
  const minThreshold = 1;

  return (
    <DAOFormContainer>
      <FormInput<"voting.threshold">
        inputProps={{
          id: "voting.threshold",
          isTooltipVisible: true,
          tooltipLabel: DAOToolTips.threshold,
          label: "Threshold",
          type: "number",
          placeholder: "Enter amount",
          toolTipLabelPlacement: "top",
          unit: `out of ${maxThreshold} Members`,
          register: {
            ...register("voting.threshold", {
              required: { value: true, message: "A threshold is required." },
              max: {
                value: maxThreshold,
                message: "Threshold cannot be greater than the total number of members.",
              },
              min: { value: minThreshold, message: "Threshold be at least one member." },
            }),
          },
        }}
        isInvalid={Boolean(errors.voting?.threshold)}
        errorMessage={errors.voting?.threshold?.message}
      />
    </DAOFormContainer>
  );
}
