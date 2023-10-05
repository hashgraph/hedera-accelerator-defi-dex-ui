import { useFormContext } from "react-hook-form";
import { FormInput } from "@shared/ui-kit";
import { CreateATokenDAOForm, DAOGovernanceTokenType } from "../types";
import { DAOReviewForm } from "./DAOReviewForm";
import BigNumber from "bignumber.js";

export function TokenDAOReviewForm() {
  const { getValues } = useFormContext<CreateATokenDAOForm>();
  const { name, description, logoUrl, isPublic, type, governance, voting } = getValues();
  const initialSupplyWithPrecision =
    governance?.tokenType === DAOGovernanceTokenType.ExistingToken
      ? BigNumber(governance?.existingToken?.initialSupply).shiftedBy(-governance?.existingToken?.decimals)
      : governance?.newToken?.initialSupply;

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
            isReadOnly: true,
            value:
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.name ?? ""
                : governance?.existingToken?.name ?? "",
          }}
        />,
        <FormInput<"governance.token.symbol">
          inputProps={{
            id: "governance.token.symbol",
            label: "Token symbol",
            type: "text",
            isReadOnly: true,
            value:
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.symbol ?? ""
                : governance?.existingToken?.symbol ?? "",
          }}
        />,
        <FormInput<"governance.token.id">
          inputProps={{
            id: "governance.token.id",
            label: "Token id",
            type: "text",
            isReadOnly: true,
            value:
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.id ?? ""
                : governance?.existingToken?.id ?? "",
          }}
        />,
        <FormInput<"governance.token.decimals">
          inputProps={{
            id: "governance.token.decimals",
            label: "Decimals",
            type: "number",
            isReadOnly: true,
            value: String(
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.decimals ?? 0
                : governance?.existingToken?.decimals ?? 0
            ),
          }}
        />,
        <FormInput<"governance.token.initialSupply">
          inputProps={{
            id: "governance.token.initialSupply",
            label: "Initial token supply",
            type: "number",
            isReadOnly: true,
            unit:
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.symbol ?? ""
                : governance?.existingToken?.symbol ?? "",
            value: String(initialSupplyWithPrecision),
          }}
        />,
        <FormInput<"governance.token.treasuryWalletAccountId">
          inputProps={{
            id: "governance.token.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            isReadOnly: true,
            value:
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.treasuryWalletAccountId ?? ""
                : governance?.existingToken?.treasuryWalletAccountId ?? "",
          }}
        />,
      ]}
      voting={[
        <FormInput<"voting.quorum">
          inputProps={{
            id: "voting.quorum",
            label: "QUORUM",
            type: "number",
            unit: "%",
            value: String(voting?.quorum ?? 0),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.duration">
          inputProps={{
            id: "voting.duration",
            label: "VOTING DURATION",
            type: "number",
            unit: "Secs",
            value: String(voting?.duration ?? 0),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.lockingPeriod">
          inputProps={{
            id: "voting.lockingPeriod",
            label: "LOCKING PERIOD",
            type: "number",
            unit: "Secs",
            value: String(voting?.lockingPeriod ?? 0),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.minProposalDeposit">
          inputProps={{
            id: "voting.minProposalDeposit",
            label: "MINIMUM PROPOSAL DEPOSIT",
            type: "number",
            unit:
              governance?.tokenType === DAOGovernanceTokenType.NewToken
                ? governance?.newToken?.symbol ?? ""
                : governance?.existingToken?.symbol ?? "",
            value: "1",
            isReadOnly: true,
          }}
        />,
      ]}
    />
  );
}
