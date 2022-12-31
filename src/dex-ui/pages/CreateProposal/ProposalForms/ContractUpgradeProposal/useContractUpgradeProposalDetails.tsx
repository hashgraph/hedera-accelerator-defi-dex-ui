import { useDeployContract, useCreateProposal } from "../../../../hooks";

export function useContractUpgradeProposalDetails() {
  const deployContract = useDeployContract();
  const createProposal = useCreateProposal();
  const isLoadingDialogOpen = deployContract.isLoading || createProposal.isLoading;
  function getLoadingDialogMessage(): string {
    if (deployContract.isLoading) return "Fetching Details.. Please wait";
    if (createProposal.isLoading) return "Submitting.. Please wait";
    return "";
  }
  const loadingDialogMessage = getLoadingDialogMessage();

  const isErrorDialogOpen = deployContract.isError || createProposal.isError;
  function getErrorDialogMessage(): string {
    if (deployContract.isError) return deployContract.error?.message;
    if (createProposal.isError) return createProposal.error?.message;
    return "";
  }
  const errorDialogMessage = getErrorDialogMessage();

  return {
    deployContract,
    createProposal,
    isLoadingDialogOpen,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
  };
}
