import { useLocation, useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { useForm } from "react-hook-form";
import { Page } from "@dex/layouts";
import { Wizard, Color, LoadingDialog } from "@shared/ui-kit";
import { WarningIcon } from "@chakra-ui/icons";
import { SettingsForm } from "./types";
import { useHandleTransactionSuccess } from "@dex/hooks";
import { useFetchContract, useDAOs, useUpdateDAODetails } from "@dao/hooks";
import { getDAOLinksRecordArray } from "../utils";
import { isEmpty } from "ramda";

export function UpdateDAODetails() {
  const { accountId: daoAccountId = "" } = useParams();
  const daoAccountIdQueryResults = useFetchContract(daoAccountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const location = useLocation();
  const currentDaoType = location.pathname.split("/").at(1) ?? "";
  const backTo = `/${currentDaoType}/${daoAccountId}/settings`;
  const daosQueryResults = useDAOs();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() === daoAccountEVMAddress?.toLowerCase());
  const { webLinks } = dao ?? { webLinks: [] };
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const sendUpdateDAODetails = useUpdateDAODetails(handleUpdateDAODetailsSuccess);
  const { mutate, isLoading, isError, error, reset: resetUpdateDAODetails } = sendUpdateDAODetails;
  const updateSettingsForm = useForm<SettingsForm>({
    defaultValues: {
      ...dao,
      webLinks: getDAOLinksRecordArray(webLinks),
    },
  });
  const {
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = updateSettingsForm;

  const steps = [
    {
      label: "Details",
      route: `/${currentDaoType}/${daoAccountId}/settings/change-dao-details/details`,
      validate: async () => trigger(["name", "description"]),
    },
    {
      label: "Review",
      route: `/${currentDaoType}/${daoAccountId}/settings/change-dao-details/review`,
      isError,
      isLoading,
    },
  ];

  function reset() {
    resetForm();
    resetUpdateDAODetails();
  }

  function handleUpdateDAODetailsSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = "Successfully updated the DAO details.";
    handleTransactionSuccess(transactionResponse, message, backTo);
  }

  async function onSubmit(data: SettingsForm) {
    mutate({
      name: data.name,
      description: data.description,
      logoUrl: data.logoUrl,
      infoUrl: data.infoUrl,
      webLinks: isEmpty(data.webLinks) ? [] : data.webLinks.map((link) => link.value),
      daoAccountId,
    });
  }

  return (
    <>
      <Page
        body={
          <Wizard<SettingsForm>
            context={{
              title: "Update DAO Details",
              backLabel: "Back to Settings",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: `${currentDaoType}-change-dao-settings`,
                context: {},
                ...updateSettingsForm,
              },
              onSubmit,
            }}
            header={<Wizard.Header />}
            stepper={<Wizard.Stepper />}
            form={<Wizard.Form />}
            footer={<Wizard.Footer />}
          />
        }
      />
      <LoadingDialog
        isOpen={isSubmitting || isLoading}
        message={"Please confirm update DAO details in your wallet to proceed."}
      />
      <LoadingDialog
        isOpen={isError}
        message={error?.message ?? ""}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetUpdateDAODetails();
          },
        }}
      />
    </>
  );
}
