import { useFormContext } from "react-hook-form";
import { FormInput } from "@dex-ui-components";
import { CreateAMultiSigDAOForm } from "../types";
import { DAOReviewForm } from "./DAOReviewForm";

export function MultiSigDAOReviewForm() {
  const { getValues } = useFormContext<CreateAMultiSigDAOForm>();
  const { name, description, logoUrl, isPublic, type, governance, voting } = getValues();
  return (
    <DAOReviewForm
      details={{
        name,
        description,
        logoUrl,
        isPublic: Boolean(isPublic),
        type,
      }}
      governance={[
        <FormInput<"governance.admin">
          inputProps={{
            id: "governance.admin",
            label: "Admin Wallet",
            type: "text",
            value: governance.admin,
            isReadOnly: true,
          }}
        />,
        ...governance.owners.map((owner: Record<"value", string>, index: number) => {
          const formInputId = `governance.owners.${index}`;
          return (
            <FormInput<typeof formInputId>
              inputProps={{
                id: formInputId,
                label: "Member Wallet",
                type: "text",
                value: owner.value,
                isReadOnly: true,
              }}
            />
          );
        }),
      ]}
      voting={[
        <FormInput<"voting.threshold">
          inputProps={{
            id: "voting.threshold",
            label: "Threshold",
            type: "number",
            unit: "Members",
            value: String(voting.threshold),
            isReadOnly: true,
          }}
        />,
      ]}
    />
  );
}
