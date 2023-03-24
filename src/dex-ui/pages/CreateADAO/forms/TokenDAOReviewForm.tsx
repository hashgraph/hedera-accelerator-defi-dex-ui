import { useFormContext } from "react-hook-form";
import { FormInput } from "../../../../dex-ui-components";
import { CreateATokenDAOForm } from "../types";
import { DAOReviewForm } from "./DAOReviewForm";

export function TokenDAOReviewForm() {
  const { getValues } = useFormContext<CreateATokenDAOForm>();
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
        <FormInput<"governance.token.name">
          inputProps={{
            id: "governance.token.name",
            label: "Token name",
            type: "text",
            value: governance.token.name,
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.token.symbol">
          inputProps={{
            id: "governance.token.symbol",
            label: "Token symbol",
            type: "text",
            value: governance.token.symbol,
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.token.id">
          inputProps={{
            id: "governance.token.id",
            label: "Token id",
            type: "text",
            value: governance.token.id,
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.token.decimals">
          inputProps={{
            id: "governance.token.decimals",
            label: "Decimals",
            type: "number",
            value: String(governance.token.decimals),
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.token.initialSupply">
          inputProps={{
            id: "governance.token.initialSupply",
            label: "Initial token supply",
            type: "number",
            unit: governance.token.symbol,
            value: String(governance.token.initialSupply),
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.token.treasuryWalletAccountId">
          inputProps={{
            id: "governance.token.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            value: governance.token.treasuryWalletAccountId,
            isReadOnly: true,
          }}
        />,
      ]}
      voting={[
        <FormInput<"voting.quorum">
          inputProps={{
            id: "voting.quorum",
            label: "Quorum",
            type: "number",
            unit: "%",
            value: String(voting.quorum),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.duration">
          inputProps={{
            id: "voting.duration",
            label: "Voting duration",
            type: "number",
            unit: "Days",
            value: String(voting.duration),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.lockingPeriod">
          inputProps={{
            id: "voting.lockingPeriod",
            label: "Locking period",
            type: "number",
            unit: "Days",
            value: String(voting.lockingPeriod),
            isReadOnly: true,
          }}
        />,
      ]}
    />
  );
}
