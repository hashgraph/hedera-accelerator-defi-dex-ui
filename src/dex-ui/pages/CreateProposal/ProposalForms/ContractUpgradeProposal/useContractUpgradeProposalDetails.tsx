import { useCreateProposal } from "../../../../hooks";

export function useContractUpgradeProposalDetails() {
  const createProposal = useCreateProposal();
  const isLoadingDialogOpen = createProposal.isLoading;
  function getLoadingDialogMessage(): string {
    if (createProposal.isLoading) return "Submitting.. Please wait";
    return "";
  }
  const loadingDialogMessage = getLoadingDialogMessage();

  const isErrorDialogOpen = createProposal.isError;
  function getErrorDialogMessage(): string {
    if (createProposal.isError) return createProposal.error?.message;
    return "";
  }
  const errorDialogMessage = getErrorDialogMessage();

  return {
    createProposal,
    isLoadingDialogOpen,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
  };
}
