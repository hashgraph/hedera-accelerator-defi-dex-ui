import { useState } from "react";
import { Divider, Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import {
  AlertDialog,
  Button,
  Color,
  FormInput,
  TwoLayerSettingsIcon,
  Notification,
  NotficationTypes,
} from "../../../../dex-ui-components";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { useTabFilters } from "../../../hooks";
import { FieldErrorsImpl, useForm, UseFormReturn } from "react-hook-form";
import { isEmpty } from "ramda";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { InputTokenAmountData, ManageVotingPowerTabType } from "./types";
import { formulaTypes } from "../../../../dex-ui-components/presets/types";
import { halfOf } from "../../../../dex-ui-components/presets/utils";

interface ManageVotingPowerModalBodyProps {
  tokenSymbol: string;
  lockedGODToken: string;
  lockedGODTokenValue?: string;
  totalGODTokenBalance: string;
  totalGODTokenBalanceValue?: string;
  availableGODTokenBalance: string;
  availableGODTokenBalanceValue?: string;
  isLoading?: boolean;
  canUserClaimGODTokens?: boolean;
  hidePendingStatus?: boolean;
  form: UseFormReturn<InputTokenAmountData>;
  errors: Partial<FieldErrorsImpl<InputTokenAmountData>>;
  onLockButtonClick: (data: InputTokenAmountData) => void;
  onUnlockButtonClick: (data: InputTokenAmountData) => void;
}

export interface InputLabelProps {
  tokenSymbol: string;
  balance: string;
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
          {props.tokenSymbol}
        </Text>
      </Flex>
    </Flex>
  );
};

interface RightUnitItemProps {
  tokenSymbol: string;
  handleHalfButtonClicked: () => void;
  handleMaxButtonClicked: () => void;
}

const RightUnitItem = (props: RightUnitItemProps): React.ReactElement => {
  const { tokenSymbol, handleHalfButtonClicked, handleMaxButtonClicked } = props;
  return (
    <Flex alignItems="center" gap="5px">
      <Flex gap="5px">
        <Button variant="link" textStyle="link" onClick={handleHalfButtonClicked}>
          HALF
        </Button>
        <Button variant="link" textStyle="link" onClick={handleMaxButtonClicked}>
          MAX
        </Button>
      </Flex>
      <Divider height="35px" orientation="vertical"></Divider>
      {<Text textStyle="p medium regular">{tokenSymbol}</Text>}
    </Flex>
  );
};

function ManageVotingPowerModalBody(props: ManageVotingPowerModalBodyProps) {
  function setInputAmountWithFormula(formula: formulaTypes = formulaTypes.MAX) {
    const godTokenAmount =
      formula === formulaTypes.MAX
        ? tabIndex === ManageVotingPowerTabType.Lock
          ? Number(props.availableGODTokenBalance)
          : Number(props.lockedGODToken)
        : tabIndex === ManageVotingPowerTabType.Lock
        ? halfOf(Number(props.availableGODTokenBalance))
        : halfOf(Number(props.lockedGODToken));

    if (tabIndex === ManageVotingPowerTabType.Lock) {
      props.form.setValue("lockAmount", `${godTokenAmount}`);
    } else {
      props.form.setValue("unLockAmount", `${godTokenAmount}`);
    }
  }

  function handleMaxButtonClicked() {
    setInputAmountWithFormula(formulaTypes.MAX);
  }

  function handleHalfButtonClicked() {
    setInputAmountWithFormula(formulaTypes.HALF);
  }

  const defaultTabIndex =
    Number(props.lockedGODToken) === Number(props.totalGODTokenBalance) && Number(props.lockedGODToken) > 0
      ? ManageVotingPowerTabType.Unlock
      : ManageVotingPowerTabType.Lock;
  const { tabIndex, handleTabChange } = useTabFilters(defaultTabIndex);
  const formValues: InputTokenAmountData = structuredClone(props.form.getValues());

  const isUnlockTabDisabled = Number(props.lockedGODToken) <= 0;
  const isLockTabDisabled = Number(props.availableGODTokenBalance) <= 0;
  const isUnlockButtonEnabled = props.canUserClaimGODTokens;

  const isSubmitButtonDisabled =
    tabIndex === ManageVotingPowerTabType.Lock
      ? isEmpty(formValues.lockAmount)
      : isEmpty(formValues.unLockAmount) || !isUnlockButtonEnabled;

  return (
    <Flex flexDirection="column" height="fit-content">
      <Divider marginBottom="20px" />
      <HStack height="120px" justify="center" borderRadius="8px" background={Color.Neutral._50}>
        <GOVTokenDetails
          tokenSymbol={props.tokenSymbol}
          lockedGODToken={props.lockedGODToken}
          totalGODTokenBalance={props.totalGODTokenBalance}
          availableGODTokenBalance={props.availableGODTokenBalance}
          hidePendingStatus
          isLoading={props.isLoading}
        />
      </HStack>
      <Tabs onChange={handleTabChange} index={tabIndex}>
        <TabList>
          <Tab isDisabled={isLockTabDisabled}>Lock</Tab>
          <Tab isDisabled={isUnlockTabDisabled}>Unlock</Tab>
        </TabList>
        <TabPanels>
          <TabPanel padding="1rem 0">
            <FormInput<"lockAmount">
              inputProps={{
                isReadOnly: isLockTabDisabled,
                id: "lockAmount",
                pointerEvents: "all",
                label: <InputLabel tokenSymbol={props.tokenSymbol} balance={props.availableGODTokenBalance} />,
                type: "number",
                unit: (
                  <RightUnitItem
                    tokenSymbol={props.tokenSymbol}
                    handleHalfButtonClicked={handleHalfButtonClicked}
                    handleMaxButtonClicked={handleMaxButtonClicked}
                  />
                ),
                placeholder: "",
                register: {
                  ...props.form.register("lockAmount", {
                    validate: (value) =>
                      Number(value) <= Number(props.availableGODTokenBalance) ||
                      "Cannot lock more than available balance.",
                  }),
                },
              }}
              isInvalid={Boolean(props.form.formState.errors.lockAmount)}
              errorMessage={props.errors.lockAmount && props.errors.lockAmount?.message}
            />
          </TabPanel>
          <TabPanel padding="1rem 0">
            <FormInput<"unLockAmount">
              inputProps={{
                id: "unLockAmount",
                isReadOnly: !isUnlockButtonEnabled,
                pointerEvents: "all",
                label: <InputLabel tokenSymbol={props.tokenSymbol} balance={props.lockedGODToken} />,
                type: "number",
                unit: (
                  <RightUnitItem
                    tokenSymbol={props.tokenSymbol}
                    handleHalfButtonClicked={handleHalfButtonClicked}
                    handleMaxButtonClicked={handleMaxButtonClicked}
                  />
                ),
                placeholder: "",
                register: {
                  ...props.form.register("unLockAmount", {
                    validate: (value) =>
                      Number(value) <= Number(props.lockedGODToken) || "Cannot unlock more than locked balance",
                  }),
                },
              }}
              isInvalid={Boolean(props.form.formState.errors.unLockAmount)}
              errorMessage={props.errors.unLockAmount && props.errors.unLockAmount?.message}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {!isUnlockButtonEnabled && tabIndex === ManageVotingPowerTabType.Unlock ? (
        <Flex width="fit-content" alignItems="center" margin="0px 15px 20px 15px">
          <Notification
            type={NotficationTypes.WARNING}
            message={`You have voted on proposals where the voting period is still in progress, so 
            any unlocked ${props.tokenSymbol} tokens will be pending unlocks until the in-progress
            proposals are either complete or canceled.`}
            textStyle="p small regular"
          />
        </Flex>
      ) : null}

      <Button
        variant="primary"
        type="submit"
        isDisabled={isSubmitButtonDisabled}
        leftIcon={tabIndex === ManageVotingPowerTabType.Lock ? <LockIcon /> : <UnlockIcon />}
        onClick={
          tabIndex === ManageVotingPowerTabType.Lock
            ? props.form.handleSubmit(props.onLockButtonClick)
            : props.form.handleSubmit(props.onUnlockButtonClick)
        }
      >
        {tabIndex === ManageVotingPowerTabType.Lock
          ? formValues.lockAmount.length !== 0
            ? `Lock ${formValues.lockAmount} ${props.tokenSymbol}`
            : "Lock"
          : formValues.unLockAmount.length !== 0
          ? `Unlock ${formValues.unLockAmount} ${props.tokenSymbol}`
          : "Unlock"}
      </Button>
    </Flex>
  );
}

export interface ManageVotingPowerProps {
  tokenSymbol: string;
  errorMessage?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  lockedGODToken: string;
  lockedGODTokenValue?: string;
  totalGODTokenBalance: string;
  totalGODTokenBalanceValue?: string;
  availableGODTokenBalance: string;
  availableGODTokenBalanceValue?: string;
  hidePendingStatus?: boolean;
  isSubmitButtonDisabled?: boolean;
  canUserClaimGODTokens?: boolean;
  onErrorMessageDismiss?: () => void | undefined;
  onClose?: () => void | undefined;
  onLockClick: (data: InputTokenAmountData) => void;
  onUnlockClick: (data: InputTokenAmountData) => void;
}

export const ManageVotingPower = (props: ManageVotingPowerProps) => {
  const [dialogsOpenState, setDialogsOpenState] = useState(false);

  const manageGovTokenForm = useForm<InputTokenAmountData>({
    defaultValues: {
      unLockAmount: "",
      lockAmount: "",
    },
  });
  manageGovTokenForm.watch(["lockAmount", "unLockAmount"]);

  function handleLockButtonClick(data: InputTokenAmountData) {
    props.onLockClick(data);
    setDialogsOpenState(false);
  }

  function handleUnLockButtonClick(data: InputTokenAmountData) {
    props.onUnlockClick(data);
    setDialogsOpenState(false);
  }

  return (
    <form>
      <AlertDialog
        title={`Manage ${props.tokenSymbol} token`}
        size={["xl", "xxl"]}
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
        body={
          <ManageVotingPowerModalBody
            tokenSymbol={props.tokenSymbol}
            isLoading={props.isLoading}
            lockedGODToken={props.lockedGODToken}
            totalGODTokenBalance={props.totalGODTokenBalance}
            availableGODTokenBalance={props.availableGODTokenBalance}
            canUserClaimGODTokens={props.canUserClaimGODTokens}
            form={manageGovTokenForm}
            errors={manageGovTokenForm.formState.errors}
            onLockButtonClick={handleLockButtonClick}
            onUnlockButtonClick={handleUnLockButtonClick}
          />
        }
        alertDialogOpen={dialogsOpenState}
        onAlertDialogOpen={() => {
          setDialogsOpenState(true);
        }}
        onAlertDialogClose={() => {
          setDialogsOpenState(false);
          manageGovTokenForm.reset();
        }}
      />
    </form>
  );
};
