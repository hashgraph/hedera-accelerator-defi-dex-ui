import { useForm } from "react-hook-form";
import { Color, LoadingDialog, Wizard } from "@shared/ui-kit";
import { Page } from "@dex/layouts";
import {
  CreateADAOForm,
  CreateAMultiSigDAOForm,
  CreateANFTDAOForm,
  CreateATokenDAOForm,
  DAOGovernanceTokenType,
  DAONFTTokenType,
  NFTDAOGovernanceData,
  TokenDAOGovernanceData,
} from "./types";
import { useHandleTransactionSuccess } from "@dex/hooks";
import { useCreateDAO, useFetchDAOConfig } from "@dao/hooks";
import { WarningIcon } from "@chakra-ui/icons";
import { TransactionResponse } from "@hashgraph/sdk";
import { Routes } from "@dao/routes";
import { DAOType } from "@dao/services";

export function CreateADAOPage() {
  const backTo = Routes.Home;
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const createDAOPageForm = useForm<CreateADAOForm>({
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      isPublic: true,
      type: DAOType.GovernanceToken,
    },
  });
  const {
    getValues,
    trigger,
    watch,
    register,
    formState: { isSubmitting },
  } = createDAOPageForm;
  const { isPublic, type, name, governance } = getValues();
  watch("type");
  const isNewTokenIdRequired =
    type === DAOType.GovernanceToken &&
    (governance as TokenDAOGovernanceData)?.tokenType === DAOGovernanceTokenType.NewToken;

  register("governance.newToken.id", {
    required: {
      value: isNewTokenIdRequired,
      message: "A token ID is require. To generate the token ID, please define the inputs above.",
    },
  });

  function handleCreateDAOSuccess(transactionResponse: TransactionResponse) {
    const message = `Created new ${isPublic ? "public" : "private"} ${type} DAO "${name}".`;
    handleTransactionSuccess(transactionResponse, message, backTo);
  }

  const createDAO = useCreateDAO(handleCreateDAOSuccess);
  const { data: { multisigDAOFeeConfig, nftDAOFeeConfig, ftDAOFeeConfig } = {} } = useFetchDAOConfig();

  function GovernanceForm(): string {
    if (type === DAOType.GovernanceToken) return `/${Routes.Create}/${Routes.GovernanceToken}`;
    if (type === DAOType.MultiSig) return `/${Routes.Create}/${Routes.Multisig}`;
    if (type === DAOType.NFT) return `/${Routes.Create}/${Routes.NFT}`;
    return ``;
  }

  function VotingForm(): string {
    if (type === DAOType.GovernanceToken) return `/${Routes.Create}/${Routes.GovernanceTokenVoting}`;
    if (type === DAOType.MultiSig) return `/${Routes.Create}/${Routes.MultisigVoting}`;
    if (type === DAOType.NFT) return `/${Routes.Create}/${Routes.NFTVoting}`;
    return ``;
  }

  function ReviewForm(): string {
    if (type === DAOType.GovernanceToken) return `/${Routes.Create}/${Routes.GovernanceTokenReview}`;
    if (type === DAOType.MultiSig) return `/${Routes.Create}/${Routes.MultisigReview}`;
    if (type === DAOType.NFT) return `/${Routes.Create}/${Routes.NFTReview}`;
    return ``;
  }

  async function ValidateGovernanceForm(): Promise<boolean> {
    if (
      type === DAOType.GovernanceToken &&
      (governance as TokenDAOGovernanceData).tokenType === DAOGovernanceTokenType.NewToken
    )
      return trigger(["governance.newToken.id", "governance.newToken.treasuryWalletAccountId"]);
    if (
      type === DAOType.GovernanceToken &&
      (governance as TokenDAOGovernanceData).tokenType === DAOGovernanceTokenType.ExistingToken
    )
      return trigger(["governance.existingToken.id", "governance.existingToken.treasuryWalletAccountId"]);
    if (type === DAOType.NFT && (governance as NFTDAOGovernanceData).tokenType === DAONFTTokenType.NewNFT)
      return trigger(["governance.newNFT.id", "governance.newNFT.treasuryWalletAccountId"]);
    if (type === DAOType.NFT && (governance as NFTDAOGovernanceData).tokenType === DAONFTTokenType.ExistingNFT)
      return trigger(["governance.existingToken.id", "governance.existingToken.treasuryWalletAccountId"]);

    if (type === DAOType.MultiSig) return trigger(["governance.admin"]);
    return Promise.resolve(true);
  }

  async function ValidateVotingForm(): Promise<boolean> {
    if (type === DAOType.GovernanceToken) return trigger(["voting.quorum", "voting.duration", "voting.lockingPeriod"]);
    if (type === DAOType.MultiSig) return trigger(["voting.threshold"]);
    if (type === DAOType.NFT) return trigger(["voting.quorum", "voting.duration", "voting.duration"]);
    return Promise.resolve(true);
  }

  const steps = [
    {
      label: "Disclaimer",
      route: `/${Routes.Create}/${Routes.DAODisclaimer}`,
      validate: async () => trigger(["disclaimer"]),
    },
    {
      label: "Details",
      route: `/${Routes.Create}/${Routes.DAODetails}`,
      validate: async () => trigger(["name", "logoUrl", "isPublic", "description", "infoUrl"]),
    },
    {
      label: "Type",
      route: `/${Routes.Create}/${Routes.Type}`,
      validate: async () => trigger(["type"]),
    },
    {
      label: "Governance",
      route: GovernanceForm(),
      validate: async () => ValidateGovernanceForm(),
    },
    {
      label: "Voting",
      route: VotingForm(),
      validate: async () => ValidateVotingForm(),
    },
    {
      label: "Review",
      route: ReviewForm(),
      isLoading: createDAO.isLoading,
      isError: createDAO.isError,
    },
  ];

  async function onSubmit(data: CreateADAOForm) {
    const { type, name, isPublic, description, daoLinks = [], logoUrl = "", infoUrl } = data;
    if (data.type === DAOType.GovernanceToken) {
      const tokenDAOData = data as CreateATokenDAOForm;
      const { governance, voting } = tokenDAOData;
      return createDAO.mutate({
        type,
        name,
        logoUrl,
        description,
        infoUrl,
        daoLinks: daoLinks.map((link) => link.value),
        isPrivate: !isPublic,
        tokenId:
          governance.tokenType === DAOGovernanceTokenType.NewToken
            ? governance?.newToken?.id ?? ""
            : governance?.existingToken?.id ?? "",
        treasuryWalletAccountId:
          governance.tokenType === DAOGovernanceTokenType.NewToken
            ? governance?.newToken?.treasuryWalletAccountId ?? ""
            : governance?.existingToken?.treasuryWalletAccountId ?? "",
        quorum: voting?.quorum ?? 0,
        votingDuration: voting?.duration && voting.durationUnit ? voting.duration * voting.durationUnit : 0,
        lockingDuration:
          voting?.lockingPeriod && voting.lockingPeriodUnit ? voting.lockingPeriod * voting.lockingPeriodUnit : 0,
        daoFeeConfig: ftDAOFeeConfig,
      });
    }
    if (data.type === DAOType.MultiSig) {
      const multiSigDAOData = data as CreateAMultiSigDAOForm;
      const { governance, voting } = multiSigDAOData;
      return createDAO.mutate({
        type,
        description,
        daoLinks: daoLinks.map((link) => link.value),
        admin: governance.admin,
        name,
        logoUrl,
        infoUrl,
        owners: [governance.admin, ...governance.owners.map((owner) => owner.value)],
        threshold: voting.threshold,
        isPrivate: !isPublic,
        daoFeeConfig: multisigDAOFeeConfig,
      });
    }
    if (data.type === DAOType.NFT) {
      const nftDAOData = data as CreateANFTDAOForm;
      const { governance, voting } = nftDAOData;
      return createDAO.mutate({
        type,
        name,
        description,
        daoLinks: daoLinks.map((link) => link.value),
        logoUrl,
        infoUrl,
        isPrivate: !isPublic,
        tokenId:
          governance.tokenType === DAONFTTokenType.NewNFT
            ? governance?.newNFT?.id ?? ""
            : governance?.existingNFT?.id ?? "",
        treasuryWalletAccountId:
          governance.tokenType === DAONFTTokenType.NewNFT
            ? governance?.newNFT?.treasuryWalletAccountId ?? ""
            : governance?.existingNFT?.treasuryWalletAccountId ?? "",
        quorum: voting.quorum,
        votingDuration: voting?.duration && voting.durationUnit ? voting.duration * voting.durationUnit : 0,
        lockingDuration:
          voting?.lockingPeriod && voting.lockingPeriodUnit ? voting.lockingPeriod * voting.lockingPeriodUnit : 0,
        daoFeeConfig: nftDAOFeeConfig,
      });
    }
  }

  return (
    <>
      <Page
        body={
          <Wizard<CreateADAOForm>
            context={{
              title: "Create a DAO",
              backLabel: "Back to DAOs",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "create-dao",
                context: {
                  ftDAOFeeConfig,
                  multisigDAOFeeConfig,
                  nftDAOFeeConfig,
                },
                ...createDAOPageForm,
              },
              onSubmit,
            }}
            header={<Wizard.Header />}
            stepper={<Wizard.Stepper />}
            form={<Wizard.Form layerStyle="dao-wizard__form" />}
            footer={<Wizard.Footer />}
          />
        }
      />
      <LoadingDialog
        isOpen={isSubmitting || createDAO.isLoading}
        message={`Please confirm the "${name}" DAO creation transaction in your wallet to proceed.`}
      />
      <LoadingDialog
        isOpen={createDAO.isError}
        message={createDAO.error?.message ?? ""}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            createDAO.reset();
          },
        }}
      />
    </>
  );
}
