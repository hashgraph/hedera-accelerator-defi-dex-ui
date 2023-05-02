import { useFormContext } from "react-hook-form";
import { FormInput } from "@dex-ui-components";
import { CreateANFTDAOForm } from "../types";
import { DAOReviewForm } from "./DAOReviewForm";

export function NFTDAOReviewForm() {
  const { getValues } = useFormContext<CreateANFTDAOForm>();
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
        <FormInput<"governance.nft.name">
          inputProps={{
            id: "governance.nft.name",
            label: "NFT name",
            type: "text",
            value: governance.nft.name,
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.symbol">
          inputProps={{
            id: "governance.nft.symbol",
            label: "NFT symbol",
            type: "text",
            value: governance.nft.symbol,
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.id">
          inputProps={{
            id: "governance.nft.id",
            label: "NFT id",
            type: "text",
            value: governance.nft.id,
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.maxSupply">
          inputProps={{
            id: "governance.nft.maxSupply",
            label: "Max supply",
            type: "number",
            unit: governance.nft.symbol,
            value: String(governance.nft.maxSupply),
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.treasuryWalletAccountId">
          inputProps={{
            id: "governance.token.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            value: governance.nft.treasuryWalletAccountId,
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
