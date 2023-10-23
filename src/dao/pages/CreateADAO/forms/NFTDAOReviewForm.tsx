import { useFormContext } from "react-hook-form";
import { FormInput } from "@shared/ui-kit";
import { CreateANFTDAOForm, DAONFTTokenType } from "../types";
import { DAOReviewForm } from "./DAOReviewForm";
import { shortEnglishHumanizer } from "@dao/pages/utils";

export function NFTDAOReviewForm() {
  const { getValues } = useFormContext<CreateANFTDAOForm>();
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
        <FormInput<"governance.nft.name">
          key="governance.nft.name"
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
          key="governance.nft.symbol"
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
          key="governance.nft.id"
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
          key="governance.nft.maxSupply"
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
          key="governance.nft.treasuryWalletAccountId"
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
          key="voting.quorum"
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
          key="voting.duration"
          inputProps={{
            id: "voting.duration",
            label: "VOTING DURATION",
            type: "number",
            value:
              voting?.duration && voting?.duration
                ? shortEnglishHumanizer(voting.duration * voting.durationUnit * 1000)
                : "",
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.lockingPeriod">
          key="voting.lockingPeriod"
          inputProps={{
            id: "voting.lockingPeriod",
            label: "LOCKING PERIOD",
            type: "number",
            value:
              voting?.lockingPeriod && voting?.lockingPeriodUnit
                ? shortEnglishHumanizer(voting.lockingPeriod * voting.lockingPeriodUnit * 1000)
                : "",
            isReadOnly: true,
          }}
        />,
        <FormInput<"voting.minProposalDeposit">
          key="voting.minProposalDeposit"
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
