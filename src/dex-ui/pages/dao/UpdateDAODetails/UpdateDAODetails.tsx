import { Paths } from "@routes";
import { useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { useForm } from "react-hook-form";
import { Page } from "@layouts";
import { Color, LoadingDialog } from "@dex-ui-components";
import { WarningIcon } from "@chakra-ui/icons";
import { Wizard } from "@components";
import { SettingsForm } from "./types";
import { useHandleTransactionSuccess, useDAOs, useUpdateDAODetails } from "@hooks";
import { getDAOLinksRecordArray } from "../utils";

export function UpdateDAODetails() {
  const { accountId: daoAccountId = "" } = useParams();
  const backTo = `${Paths.DAOs.absolute}/${Paths.DAOs.Multisig}/${daoAccountId}/settings`;
  const daosQueryResults = useDAOs(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
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
      route: `${Paths.DAOs.absolute}/${Paths.DAOs.Multisig}/${daoAccountId}/settings/change-dao-details/details`,
      validate: async () => trigger(["name", "description"]),
    },
    {
      label: "Review",
      route: `${Paths.DAOs.absolute}/${Paths.DAOs.Multisig}/${daoAccountId}/settings/change-dao-details/review`,
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
      webLinks: data.webLinks.map((link) => link.value),
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
                id: "multi-sig-change-dao-settings",
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
