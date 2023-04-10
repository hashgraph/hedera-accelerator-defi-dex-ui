import { useState } from "react";
import { Divider, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { AlertDialog, Button, Color, FormInput } from "../../../../dex-ui-components";
import { VotingPowerCard } from "./VotingPowerCard";
import { TwoLayerSettingsIcon } from "../../../../dex-ui-components";
import { useTabFilters } from "../../../hooks";
import { FieldErrorsImpl, useForm, UseFormReturn } from "react-hook-form";
import { isEmpty } from "ramda";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { InputLabelProps, InputTokenAmountData, ManageGovTokenProps } from "./types";

interface TokenProps {
  form: UseFormReturn<InputTokenAmountData>;
  errors: Partial<FieldErrorsImpl<InputTokenAmountData>>;
  onSubmitHandle: (data: InputTokenAmountData) => void;
}

const InputLabel = (props: InputLabelProps): React.ReactElement => {
  return (
    <Flex alignItems="center" justifyContent="space-between" flex="1">
      <Text textStyle="p small medium">Amount</Text>
      <Flex alignItems="center" gap="3px">
        <Text textStyle="p xsmall regular" color={Color.Neutral._400}>
          Available:&nbsp;
        </Text>
        <Text textStyle="p xsmall semibold" color={Color.Neutral._900}>
          {props.balance}
        </Text>
        <Text textStyle="p xsmall medium" color={Color.Neutral._400}>
          GOV
        </Text>
      </Flex>
    </Flex>
  );
};

const RightUnitItem = (props: {
  handleHalfButtonClicked: () => void;
  handleMaxButtonClicked: () => void;
}): React.ReactElement => {
  return (
    <Flex alignItems="center" gap="5px">
      <Flex gap="5px">
        <Button variant="link" textStyle="link" onClick={props.handleHalfButtonClicked}>
          HALF
        </Button>
        <Button variant="link" textStyle="link" onClick={props.handleMaxButtonClicked}>
          MAX
        </Button>
      </Flex>
      <Divider height="35px" orientation="vertical"></Divider>
      {<Text textStyle="p medium regular">GOV</Text>}
    </Flex>
  );
};

function ManageGovTokenModalBody(props: TokenProps) {
  const { tabIndex, handleTabChange } = useTabFilters();

  function handleHalfButtonClicked() {
    console.log("handleMaxButtonClicked Pressed");
  }

  function handleMaxButtonClicked() {
    console.log("handleMaxButtonClicked Pressed");
  }

  const formValues: InputTokenAmountData = structuredClone(props.form.getValues());
  const isSubmitButtonDisabled = tabIndex === 0 ? isEmpty(formValues.lockAmount) : isEmpty(formValues.unLockAmount);

  return (
    <Flex flexDirection="column" padding="8x 16px">
      <Divider marginBottom="20px" />
      <VotingPowerCard balance={200000} hidePendingStatus />
      <Tabs onChange={handleTabChange} index={tabIndex}>
        <TabList margin="0px 15px 0px 15px">
          <Tab>Lock</Tab>
          <Tab>Unlock</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormInput<"lockAmount">
              inputProps={{
                id: "lockAmount",
                pointerEvents: "all",
                label: <InputLabel balance="20000.00" />,
                type: "number",
                unit: (
                  <RightUnitItem
                    handleHalfButtonClicked={handleHalfButtonClicked}
                    handleMaxButtonClicked={handleMaxButtonClicked}
                  />
                ),
                placeholder: "",
                register: {
                  ...props.form.register("lockAmount", {
                    required: { value: true, message: "Amount cannot be more than available balance." },
                  }),
                },
              }}
              isInvalid={Boolean(props.form.formState.errors.lockAmount)}
              errorMessage={props.errors.lockAmount && props.errors.lockAmount.message}
            />
          </TabPanel>
          <TabPanel>
            <FormInput<"unLockAmount">
              inputProps={{
                id: "unLockAmount",
                pointerEvents: "all",
                label: <InputLabel balance="10000.00" />,
                type: "number",
                unit: (
                  <RightUnitItem
                    handleHalfButtonClicked={handleHalfButtonClicked}
                    handleMaxButtonClicked={handleMaxButtonClicked}
                  />
                ),
                placeholder: "",
                register: {
                  ...props.form.register("unLockAmount", {
                    required: { value: true, message: "unlock amount cannot be more than locked balance." },
                  }),
                },
              }}
              isInvalid={Boolean(props.form.formState.errors.unLockAmount)}
              errorMessage={props.errors.unLockAmount && props.errors.unLockAmount.message}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Button
        variant="primary"
        type="submit"
        isDisabled={isSubmitButtonDisabled}
        leftIcon={tabIndex === 0 ? <LockIcon /> : <UnlockIcon />}
        onClick={props.form.handleSubmit(props.onSubmitHandle)}
        margin="0px 15px 0px 15px"
      >
        {tabIndex === 0 ? "Lock" : "Unlock"}
      </Button>
    </Flex>
  );
}

export const ManageGovToken = (props: ManageGovTokenProps) => {
  const [dialogsOpenState, setDialogsOpenState] = useState(false);

  const manageGovTokenForm = useForm<InputTokenAmountData>({
    defaultValues: {
      unLockAmount: "",
      lockAmount: "",
    },
  });
  manageGovTokenForm.watch(["lockAmount", "unLockAmount"]);

  function onSubmit(data: InputTokenAmountData) {
    console.log("Submit Pressed", data);
  }

  return (
    <form>
      <AlertDialog
        title="Manage GOV token"
        size="xl"
        dialogWidth="623px"
        openModalComponent={
          <Button
            key="manage-gov"
            variant="secondary"
            padding="0px 10px 0px 10px"
            width="104px"
            leftIcon={<TwoLayerSettingsIcon />}
          >
            <Text textStyle="p small semibold">Manage</Text>
          </Button>
        }
        openDialogButtonText="Manage"
        isOpenDialogButtonDisabled={props.isSubmitButtonDisabled}
        body={
          <ManageGovTokenModalBody
            form={manageGovTokenForm}
            errors={manageGovTokenForm.formState.errors}
            onSubmitHandle={onSubmit}
          />
        }
        alertDialogOpen={dialogsOpenState}
        onAlertDialogOpen={props.onLockClick}
        onAlertDialogClose={() => {
          setDialogsOpenState(false);
          manageGovTokenForm.reset();
        }}
      />
    </form>
  );
};
