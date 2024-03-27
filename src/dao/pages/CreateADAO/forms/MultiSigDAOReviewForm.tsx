import { useFormContext } from "react-hook-form";
import { FormInput } from "@shared/ui-kit";
import { CreateAMultiSigDAOForm } from "../types";
import { DAOReviewForm } from "./DAOReviewForm";

export function MultiSigDAOReviewForm() {
  const { getValues } = useFormContext<CreateAMultiSigDAOForm>();
  const { name, description, logoUrl, isPublic, type, governance, voting, infoUrl } = getValues();
  return (
    <DAOReviewForm
      details={{
        name,
        description,
        logoUrl,
        infoUrl,
        isPublic: Boolean(isPublic),
        type,
      }}
      governance={[
        <FormInput<"governance.admin">
          key="governance.admin"
          inputProps={{
            id: "governance.admin",
            label: "ADMIN ACCOUNT",
            type: "text",
            value: governance?.admin,
            isReadOnly: true,
          }}
        />,
        ...(governance?.owners ?? []).map((owner: Record<"value", string>, index: number) => {
          const formInputId = `governance.owners.${index}`;
          return (
            <FormInput<typeof formInputId>
              key={formInputId}
              inputProps={{
                id: formInputId,
                label: "MEMBER ACCOUNT",
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
          key="voting.threshold"
          inputProps={{
            id: "voting.threshold",
            label: "THRESHOLD",
            type: "number",
            unit: "Members",
            value: String(voting?.threshold ?? 0),
            isReadOnly: true,
          }}
        />,
      ]}
    />
  );
}
