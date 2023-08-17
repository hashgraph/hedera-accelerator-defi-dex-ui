import { useFormContext } from "react-hook-form";
import { FormInput } from "@shared/ui-kit";
import { CreateANFTDAOForm, DAONFTTokenType } from "../types";
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
            value:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.name ?? ""
                : governance?.existingNFT?.name ?? "",
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.symbol">
          inputProps={{
            id: "governance.nft.symbol",
            label: "NFT symbol",
            type: "text",
            value:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.symbol ?? ""
                : governance?.existingNFT?.symbol ?? "",
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.id">
          inputProps={{
            id: "governance.nft.id",
            label: "NFT id",
            type: "text",
            value:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.id ?? ""
                : governance?.existingNFT?.id ?? "",
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.maxSupply">
          inputProps={{
            id: "governance.nft.maxSupply",
            label: "Max supply",
            type: "number",
            unit:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.symbol ?? ""
                : governance?.existingNFT?.symbol ?? "",
            value:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? String(governance?.newNFT?.maxSupply ?? "")
                : String(governance?.existingNFT?.maxSupply ?? ""),
            isReadOnly: true,
          }}
        />,
        <FormInput<"governance.nft.treasuryWalletAccountId">
          inputProps={{
            id: "governance.token.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            value:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.treasuryWalletAccountId ?? ""
                : governance?.existingNFT?.treasuryWalletAccountId ?? "",
            isReadOnly: true,
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
            value: String(voting?.quorum ?? ""),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.duration">
          inputProps={{
            id: "voting.duration",
            label: "VOTING DURATION",
            type: "number",
            unit: "Blocks",
            value: String(voting?.duration ?? ""),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.lockingPeriod">
          inputProps={{
            id: "voting.lockingPeriod",
            label: "LOCKING PERIOD",
            type: "number",
            unit: "Blocks",
            value: String(voting?.lockingPeriod ?? ""),
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.minProposalDeposit">
          inputProps={{
            id: "voting.minProposalDeposit",
            label: "MINIMUM PROPOSAL DEPOSIT",
            type: "number",
            unit:
              governance?.tokenType === DAONFTTokenType.NewNFT
                ? governance?.newNFT?.symbol ?? ""
                : governance?.existingNFT?.symbol ?? "",
            value: "1",
            isReadOnly: true,
          }}
        />,
      ]}
    />
  );
}
