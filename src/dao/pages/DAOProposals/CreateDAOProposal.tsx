import { useLocation, useNavigate } from "react-router-dom";
import { CreateDAOProposalForm, DAOProposalType } from "./types";
import type { CreateDAODexSettingsForm } from "./types";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page } from "@dex/layouts";
import { Routes } from "@dao/routes";
import { useForm } from "react-hook-form";
import { Wizard, Color, LoadingDialog } from "@shared/ui-kit";
import { WarningIcon } from "@chakra-ui/icons";
import { DAOType, GovernanceDAODetails, MultiSigDAODetails, NFTDAODetails } from "@dao/services";
import { DEFAULT_NFT_TOKEN_SERIAL_ID } from "@dex/services";
import { useDAOs, useFetchContract, usePinToIPFS } from "@dao/hooks";
import { useHandleTransactionSuccess, useAccountTokenBalances } from "@dex/hooks";
import { isNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";
import { getLastPathInRoute } from "@dex/utils";
import { Button, Flex } from "@chakra-ui/react";
import { ethers } from "ethers";
import { SINGLE_DAO_DEX_SETTINGS, SINGLE_DAO_ID } from "@dao/config/singleDao";
import { ContractId, TokenId } from "@hashgraph/sdk";
import { DexService } from "@dex/services";
import { useCreateHuffyRiskParametersProposal } from "@dao/hooks/useCreateHuffyRiskParametersProposal";
import { useCreateHuffyAddTradingPairProposal } from "@dao/hooks/useCreateHuffyAddTradingPairProposal";
import { useCreateHuffyRemoveTradingPairProposal } from "@dao/hooks/useCreateHuffyRemoveTradingPairProposal";

export function CreateDAOProposal() {
  const daoAccountId = SINGLE_DAO_ID;
  const daoAccountIdQueryResults = useFetchContract(daoAccountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() === daoAccountEVMAddress?.toLowerCase());
  const pinToIPFSResults = usePinToIPFS();
  const {
    isLoading: isPinningToIPFSLoading,
    isError: isPinningToIPFSFailed,
    error: isPinningToIPFSError,
    reset: resetPinMetadataToIPFS,
  } = pinToIPFSResults;

  const createDaoProposalForm = useForm<CreateDAOProposalForm>({
    defaultValues: {
      type: undefined,
      title: "",
      description: "",
      linkToDiscussion: "",
      maxTradeBps: undefined,
      maxSlippageBps: undefined,
      tradeCooldownSec: undefined,
      whitelistAdd: [],
      whitelistRemove: [],
    },
  });
  const {
    trigger,
    getValues,
    watch,
    reset: resetForm,
    formState: { isSubmitting },
  } = createDaoProposalForm;
  watch("type");
  const location = useLocation();
  const navigate = useNavigate();
  const currentDaoType = (() => {
    switch ((dao as any)?.type) {
      case DAOType.MultiSig:
        return Routes.Multisig;
      case DAOType.GovernanceToken:
        return Routes.GovernanceToken;
      case DAOType.NFT:
        return Routes.NFT;
      default:
        return "";
    }
  })();
  const currentWizardStep = getLastPathInRoute(location.pathname);
  const backTo = `/${Routes.Overview}`;
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const { ownerIds, threshold, safeEVMAddress } = (dao as MultiSigDAODetails) ?? {};
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress ?? "");
  const safeAccountId = daoSafeIdQueryResults.data?.data.contract_id ?? "";
  const {
    tokenId: governanceTokenId = "",
    governorAddress,
    assetsHolderAddress,
  } = (dao as GovernanceDAODetails | NFTDAODetails) ?? {};
  const { type } = getValues();

  const daoGovernanceQueryResults = useFetchContract(governorAddress ?? "");
  const daoGovernance = daoGovernanceQueryResults.data?.data.contract_id ?? "";
  const daoAssetHolderQueryResults = useFetchContract(assetsHolderAddress ?? "");
  const daoAssetHolder = daoAssetHolderQueryResults.data?.data.contract_id ?? "";
  const transferFrom = currentDaoType === Routes.Multisig ? safeAccountId : daoAssetHolder;
  const wizardTitle = currentWizardStep === Routes.Type ? "New Proposal" : type;
  const accountTokenBalancesQueryResults = useAccountTokenBalances(
    currentDaoType === Routes.Multisig ? safeAccountId : daoAccountId
  );
  const { data: tokenBalances } = accountTokenBalancesQueryResults;

  const sendHuffyRiskParametersProposalResults = useCreateHuffyRiskParametersProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateHuffyRiskParametersProposalLoading,
    isError: isCreateHuffyRiskParametersProposalFailed,
    error: isCreateHuffyRiskParametersProposalError,
    mutate: createHuffyRiskParametersProposal,
    reset: resetCreateHuffyRiskParametersProposal,
  } = sendHuffyRiskParametersProposalResults;

  const sendHuffyAddTradingPairProposalResults = useCreateHuffyAddTradingPairProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateHuffyAddTradingPairProposalLoading,
    isError: isCreateHuffyAddTradingPairProposalFailed,
    error: isCreateHuffyAddTradingPairProposalError,
    mutate: createHuffyAddTradingPairProposal,
    reset: resetCreateHuffyAddTradingPairProposal,
  } = sendHuffyAddTradingPairProposalResults;

  const sendHuffyRemoveTradingPairProposalResults =
    useCreateHuffyRemoveTradingPairProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateHuffyRemoveTradingPairProposalLoading,
    isError: isCreateHuffyRemoveTradingPairProposalFailed,
    error: isCreateHuffyRemoveTradingPairProposalError,
    mutate: createHuffyRemoveTradingPairProposal,
    reset: resetCreateHuffyRemoveTradingPairProposal,
  } = sendHuffyRemoveTradingPairProposalResults;

  const isLoading =
    isPinningToIPFSLoading ||
    isCreateHuffyRiskParametersProposalLoading ||
    isCreateHuffyAddTradingPairProposalLoading ||
    isCreateHuffyRemoveTradingPairProposalLoading;

  const isError =
    isPinningToIPFSFailed ||
    isCreateHuffyRiskParametersProposalFailed ||
    isCreateHuffyAddTradingPairProposalFailed ||
    isCreateHuffyRemoveTradingPairProposalFailed;

  function getDetailsRoute() {
    return `/${Routes.CreateDAOProposal}/${Routes.DAOHuffyDetails}`;
  }
  function getRiskParamsRoute() {
    return `/${Routes.CreateDAOProposal}/${Routes.DAOHuffyRiskParamsDetails}`;
  }
  function getAddTradingPairRoute() {
    return `/${Routes.CreateDAOProposal}/${Routes.DAOHuffyAddTradingPairDetails}`;
  }
  function getRemoveTradingPairRoute() {
    return `/${Routes.CreateDAOProposal}/${Routes.DAOHuffyRemoveTradingPairDetails}`;
  }
  function getRiskParamsReviewRoute() {
    return `/${Routes.CreateDAOProposal}/${Routes.DAOHuffyRiskParamsReview}`;
  }
  function getTradingPairReviewRoute() {
    return `/${Routes.CreateDAOProposal}/${Routes.DAOHuffyTradingPairReview}`;
  }

  const steps = (() => {
    switch (type) {
      case DAOProposalType.HuffyRiskParametersProposal:
        return [
          {
            label: "Type",
            route: `/${Routes.CreateDAOProposal}/${Routes.DAOProposalType}`,
            validate: async () => trigger(["type"]),
          },
          {
            label: "Details",
            route: getDetailsRoute(),
            validate: async () => trigger(["title", "description", "linkToDiscussion"]),
          },
          {
            label: "Configuration",
            route: getRiskParamsRoute(),
            validate: async () => trigger(["maxTradeBps", "maxSlippageBps", "tradeCooldownSec"]),
          },
          {
            label: "Review",
            route: getRiskParamsReviewRoute(),
            isLoading,
            isError,
          },
        ];
      case DAOProposalType.HuffyAddTradingPairProposal:
        return [
          {
            label: "Type",
            route: `/${Routes.CreateDAOProposal}/${Routes.DAOProposalType}`,
            validate: async () => trigger(["type"]),
          },
          {
            label: "Details",
            route: getDetailsRoute(),
            validate: async () => trigger(["title", "description", "linkToDiscussion"]),
          },
          {
            label: "Configuration",
            route: getAddTradingPairRoute(),
            validate: async () => trigger(["whitelistAdd.0.tokenA", "whitelistAdd.0.tokenB"]),
          },
          {
            label: "Review",
            route: getTradingPairReviewRoute(),
            isLoading,
            isError,
          },
        ];
      case DAOProposalType.HuffyRemoveTradingPairProposal:
        return [
          {
            label: "Type",
            route: `/${Routes.CreateDAOProposal}/${Routes.DAOProposalType}`,
            validate: async () => trigger(["type"]),
          },
          {
            label: "Details",
            route: getDetailsRoute(),
            validate: async () => trigger(["title", "description", "linkToDiscussion"]),
          },
          {
            label: "Configuration",
            route: getRemoveTradingPairRoute(),
            validate: async () => Promise.resolve(true),
          },
          {
            label: "Review",
            route: getTradingPairReviewRoute(),
            isLoading,
            isError,
          },
        ];

      default:
        return [];
    }
  })();

  function resetTransactions() {
    resetPinMetadataToIPFS();
    resetCreateHuffyRiskParametersProposal();
    resetCreateHuffyAddTradingPairProposal();
    resetCreateHuffyRemoveTradingPairProposal();
  }

  function reset() {
    resetForm();
    resetTransactions();
  }

  function GetFormErrorMessage(): string {
    if (isPinningToIPFSError) return isPinningToIPFSError.response?.data.error || isPinningToIPFSError.message;
    if (isCreateHuffyRiskParametersProposalError) return isCreateHuffyRiskParametersProposalError.message;
    if (isCreateHuffyAddTradingPairProposalError) return isCreateHuffyAddTradingPairProposalError.message;
    if (isCreateHuffyRemoveTradingPairProposalError) return isCreateHuffyRemoveTradingPairProposalError.message;
    return "";
  }

  const errorMessage = GetFormErrorMessage();

  function handleCreateDAOProposalSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = `Created a new '${type}' proposal.`;
    const pathTo = `/${Routes.Overview}`;
    handleTransactionSuccess(transactionResponse, message, pathTo);
  }

  function onBackToDAOLinkClick() {
    navigate(backTo);
  }

  async function onSubmit(data: CreateDAOProposalForm) {
    switch (type) {
      case DAOProposalType.HuffyRiskParametersProposal: {
        const {
          title,
          description,
          linkToDiscussion = "",
          maxTradeBps,
          maxSlippageBps,
          tradeCooldownSec,
        } = data as CreateDAODexSettingsForm;

        const psCfg = SINGLE_DAO_DEX_SETTINGS?.parameterStore;
        if (!psCfg?.contractId || !psCfg?.abi) return;

        const psAddress = ContractId.fromString(psCfg.contractId).toSolidityAddress();
        const { JsonRpcSigner } = DexService.getJsonRpcProviderAndSigner();
        const readContract = new ethers.Contract(psAddress, psCfg.abi, JsonRpcSigner);

        let currentMaxTrade: number | undefined;
        let currentMaxSlippage: number | undefined;
        let currentCooldown: number | undefined;
        try {
          if (psCfg.methods?.maxTradeBps) {
            const v = await readContract[psCfg.methods.maxTradeBps]();
            currentMaxTrade = Number(v.toString());
          }
        } catch {
          console.error("failed to read maxTradeBps");
        }
        try {
          if (psCfg.methods?.maxSlippageBps) {
            const v = await readContract[psCfg.methods.maxSlippageBps]();
            currentMaxSlippage = Number(v.toString());
          }
        } catch {
          console.error("failed to read maxSlippageBps");
        }
        try {
          if (psCfg.methods?.tradeCooldownSec) {
            const v = await readContract[psCfg.methods.tradeCooldownSec]();
            currentCooldown = Number(v.toString());
          }
        } catch {
          console.error("failed to read tradeCooldownSec");
        }
        if (currentMaxTrade === undefined || currentMaxSlippage === undefined || currentCooldown === undefined) {
          try {
            const readAllMethod = psCfg.methods?.getRiskParameters;
            const tuple = await readContract[readAllMethod!]();
            if (Array.isArray(tuple) && tuple?.length >= 3) {
              currentMaxTrade = Number(tuple[0].toString());
              currentMaxSlippage = Number(tuple[1].toString());
              currentCooldown = Number(tuple[2].toString());
            }
          } catch {
            console.error("failed to read readAll");
          }
        }

        const newMaxTrade = maxTradeBps === undefined ? currentMaxTrade ?? 0 : Number(maxTradeBps);
        const newMaxSlippage = maxSlippageBps === undefined ? currentMaxSlippage ?? 0 : Number(maxSlippageBps);
        const newCooldown = tradeCooldownSec === undefined ? currentCooldown ?? 0 : Number(tradeCooldownSec);

        const psInterface = new ethers.utils.Interface(psCfg.abi as any);
        const calldata = psInterface.encodeFunctionData("setParameters", [newMaxTrade, newMaxSlippage, newCooldown]);

        return createHuffyRiskParametersProposal({
          governanceTokenId,
          title,
          description,
          governorContractId: daoGovernance,
          target: psAddress,
          linkToDiscussion,
          daoType: DAOType.GovernanceToken,
          nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
          calldata,
        });
      }

      case DAOProposalType.HuffyAddTradingPairProposal: {
        const { title, description, linkToDiscussion = "", whitelistAdd } = data as CreateDAODexSettingsForm;

        const pwCfg = SINGLE_DAO_DEX_SETTINGS?.pairWhitelist;
        if (!pwCfg?.contractId || !pwCfg?.abi) return;
        const pwAddress = ContractId.fromString(pwCfg.contractId).toSolidityAddress();
        const pwInterface = new ethers.utils.Interface(pwCfg.abi as any);
        const addPairMethod = pwCfg.methods?.addPair;

        const adds = (whitelistAdd || []).filter((p) => (p?.tokenA || "").trim() && (p?.tokenB || "").trim());
        for (const p of adds) {
          const a = (p.tokenA || "").trim();
          const b = (p.tokenB || "").trim();
          const tokenAAddress = (ethers as any)?.utils?.isAddress?.(a) ? a : TokenId.fromString(a).toSolidityAddress();
          const tokenBAddress = (ethers as any)?.utils?.isAddress?.(b) ? b : TokenId.fromString(b).toSolidityAddress();
          const calldata = pwInterface.encodeFunctionData(addPairMethod!, [tokenAAddress, tokenBAddress]);
          createHuffyAddTradingPairProposal({
            governorContractId: daoGovernance,
            title,
            description,
            linkToDiscussion,
            calldata,
            target: pwAddress,
            value: 0,
          });
        }
        return;
      }
      case DAOProposalType.HuffyRemoveTradingPairProposal: {
        const { title, description, linkToDiscussion = "", whitelistRemove } = data as CreateDAODexSettingsForm;

        const pwCfg = SINGLE_DAO_DEX_SETTINGS?.pairWhitelist;
        if (!pwCfg?.contractId || !pwCfg?.abi) return;
        const pwAddress = ContractId.fromString(pwCfg.contractId).toSolidityAddress();
        const pwInterface = new ethers.utils.Interface(pwCfg.abi as any);
        const removePairMethod = pwCfg.methods?.removePair;

        const removes = (whitelistRemove || []).filter((p) => (p?.tokenA || "").trim() && (p?.tokenB || "").trim());
        for (const p of removes) {
          const a = (p.tokenA || "").trim();
          const b = (p.tokenB || "").trim();
          const tokenAAddress = (ethers as any)?.utils?.isAddress?.(a) ? a : TokenId.fromString(a).toSolidityAddress();
          const tokenBAddress = (ethers as any)?.utils?.isAddress?.(b) ? b : TokenId.fromString(b).toSolidityAddress();
          const calldata = pwInterface.encodeFunctionData(removePairMethod!, [tokenAAddress, tokenBAddress]);
          createHuffyRemoveTradingPairProposal({
            governorContractId: daoGovernance,
            title,
            description,
            linkToDiscussion,
            calldata,
            target: pwAddress,
            value: 0,
          });
        }
        return;
      }
    }
  }

  if (daosQueryResults.isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (daosQueryResults.isError) {
    return <ErrorLayout message={errorMessage} />;
  }

  if (isNotFound) {
    return (
      <NotFound
        message={"We didn't find any data for this DAO."}
        preLinkText={""}
        linkText={"Click here to return to the dashboard page."}
        onLinkClick={onBackToDAOLinkClick}
      />
    );
  }

  return (
    <>
      <Page
        body={
          <Wizard<CreateDAOProposalForm>
            context={{
              title: wizardTitle,
              backLabel: "Back to dashboard",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "create-dao-proposal",
                context: {
                  daoType: currentDaoType,
                  daoAccountId,
                  safeAccountId: transferFrom,
                  membersCount: ownerIds?.length ?? 0,
                  threshold,
                  proposalType: type,
                  assets: tokenBalances,
                  governanceTokenId,
                },
                ...createDaoProposalForm,
              },
              onSubmit,
            }}
            header={<Wizard.Header />}
            stepper={<Wizard.Stepper />}
            form={
              <Wizard.Form
                layerStyle={
                  type === DAOProposalType.TokenTransfer && currentWizardStep === Routes.DAODetails
                    ? "dao-wizard__form"
                    : undefined
                }
              />
            }
            footer={<Wizard.Footer />}
          />
        }
      />
      <LoadingDialog
        isOpen={isSubmitting || isLoading}
        message={`Please confirm the create proposal transaction in your wallet to proceed.`}
      />
      <LoadingDialog
        isOpen={isError}
        message={errorMessage}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttons={
          <Flex direction="row" width="256px" gap="2" paddingBottom="1rem">
            <Button
              flex="1"
              variant="secondary"
              onClick={() => {
                resetTransactions();
              }}
            >
              {"Close"}
            </Button>
            <Button
              flex="1"
              variant="primary"
              onClick={() => {
                const formData = getValues();
                onSubmit(formData);
              }}
            >
              {"Resubmit"}
            </Button>
          </Flex>
        }
      />
    </>
  );
}
