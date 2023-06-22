import { useForm } from "react-hook-form";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Page } from "@layouts";
import {
  CreateADAOForm,
  CreateAMultiSigDAOForm,
  CreateATokenDAOForm,
  CreateANFTDAOForm,
  TokenDAOGovernanceData,
  DAOGovernanceTokenType,
} from "./types";
import { useCreateDAO, useHandleTransactionSuccess } from "@hooks";
import { WarningIcon } from "@chakra-ui/icons";
import { TransactionResponse } from "@hashgraph/sdk";
import { Paths } from "@routes";
import { DAOType } from "@services";
import { Wizard } from "@components";
import { convertFromDaysToBlocks } from "@utils";

export function CreateADAOPage() {
  const backTo = `${Paths.DAOs.absolute}`;
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

  function GovernanceForm(): string {
    if (type === DAOType.GovernanceToken) return `${Paths.DAOs.absolute}/create/governance-token`;
    if (type === DAOType.MultiSig) return `${Paths.DAOs.absolute}/create/${Paths.DAOs.Multisig}`;
    if (type === DAOType.NFT) return `${Paths.DAOs.absolute}/create/nft`;
    return `${Paths.DAOs.absolute}`;
  }

  function VotingForm(): string {
    if (type === DAOType.GovernanceToken) return `${Paths.DAOs.absolute}/create/governance-token/voting`;
    if (type === DAOType.MultiSig) return `${Paths.DAOs.absolute}/create/${Paths.DAOs.Multisig}/voting`;
    if (type === DAOType.NFT) return `${Paths.DAOs.absolute}/create/nft/voting`;
    return `${Paths.DAOs.absolute}`;
  }

  function ReviewForm(): string {
    if (type === DAOType.GovernanceToken) return `${Paths.DAOs.absolute}/create/governance-token/review`;
    if (type === DAOType.MultiSig) return `${Paths.DAOs.absolute}/create/${Paths.DAOs.Multisig}/review`;
    if (type === DAOType.NFT) return `${Paths.DAOs.absolute}/create/nft/review`;
    return `${Paths.DAOs.absolute}`;
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
    if (type === DAOType.MultiSig) return trigger(["governance.admin"]);
    if (type === DAOType.NFT) return trigger(["governance.nft.id", "governance.nft.treasuryWalletAccountId"]);
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
      label: "Details",
      route: `${Paths.DAOs.absolute}/create/details`,
      validate: async () => trigger(["name", "logoUrl", "isPublic", "description"]),
    },
    {
      label: "Type",
      route: `${Paths.DAOs.absolute}/create/type`,
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
    if (data.type === DAOType.GovernanceToken) {
      const tokenDAOData = data as CreateATokenDAOForm;
      const { governance, voting, type, name, isPublic, description, daoLinks = [], logoUrl = "" } = tokenDAOData;
      const webLinks = daoLinks.map((obj, index) => [`${index}`, obj.value]).flat();
      return createDAO.mutate({
        type,
        name,
        logoUrl,
        description,
        daoLinks: webLinks,
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
        votingDuration: convertFromDaysToBlocks(voting?.duration ?? 0),
        lockingDuration: convertFromDaysToBlocks(voting?.lockingPeriod ?? 0),
      });
    }
    if (data.type === DAOType.MultiSig) {
      const multiSigDAOData = data as CreateAMultiSigDAOForm;
      const { type, name, isPublic, governance, voting, description, daoLinks = [], logoUrl = "" } = multiSigDAOData;
      const webLinks = daoLinks.map((obj, index) => [`${index}`, obj.value]).flat();
      return createDAO.mutate({
        type,
        description,
        daoLinks: webLinks,
        admin: governance.admin,
        name,
        logoUrl,
        owners: governance.owners.map((owner) => owner.value),
        threshold: voting.threshold,
        isPrivate: !isPublic,
      });
    }
    if (data.type === DAOType.NFT) {
      const nftDAOData = data as CreateANFTDAOForm;
      const { type, name, isPublic, governance, voting, description, daoLinks = [], logoUrl = "" } = nftDAOData;
      const webLinks = daoLinks.map((obj, index) => [`${index}`, obj.value]).flat();
      return createDAO.mutate({
        type,
        name,
        description,
        daoLinks: webLinks,
        logoUrl,
        isPrivate: !isPublic,
        tokenId: governance.nft.id,
        treasuryWalletAccountId: governance.nft.treasuryWalletAccountId,
        quorum: voting.quorum,
        votingDuration: convertFromDaysToBlocks(voting.duration),
        lockingDuration: convertFromDaysToBlocks(voting.lockingPeriod),
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
                context: {},
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
