import { ChangeEvent, useState } from "react";
import { Button, Divider, Flex, HStack } from "@chakra-ui/react";
import {
  Text,
  AlertDialog,
  Color,
  TwoLayerSettingsIcon,
  FormDropdown,
  InlineAlert,
  InlineAlertType,
  FormInput,
} from "@shared/ui-kit";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { FieldErrorsImpl, useForm, UseFormReturn } from "react-hook-form";
import { isEmpty } from "ramda";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { InputTokenData } from "./types";
import { MirrorNodeTokenNFT } from "@dex/services";

interface ManageVotingPowerModalBodyProps {
  tokenNFTs: MirrorNodeTokenNFT[];
  tokenSymbol: string;
  lockedNFTSerialId?: number;
  totalGODTokenBalance: string;
  totalGODTokenBalanceValue?: string;
  availableGODTokenBalance: string;
  availableGODTokenBalanceValue?: string;
  isLoading?: boolean;
  canUserClaimGODTokens?: boolean;
  hidePendingStatus?: boolean;
  form: UseFormReturn<InputTokenData>;
  errors: Partial<FieldErrorsImpl<InputTokenData>>;
  onLockButtonClick: (data: InputTokenData) => void;
  onUnlockButtonClick: (data: InputTokenData) => void;
}

function ManageVotingPowerModalBody(props: ManageVotingPowerModalBodyProps) {
  const isUnlockButtonEnabled = props.canUserClaimGODTokens;
  const warningMessage = `You have voted on proposals where the voting period is still in progress, so 
  any locked ${props.tokenSymbol} tokens can not be unlocked until the in-progress
  proposals are either complete or canceled.`;
  const {
    setValue,
    register,
    formState: { errors },
  } = props.form;

  return (
    <Flex flexDirection="column" height="fit-content" gap={4}>
      <Divider />
      <HStack height="7.5rem" justify="center" borderRadius="0.5rem" background={Color.Neutral._50} paddingX={4}>
        <GOVTokenDetails
          tokenSymbol={props.tokenSymbol}
          lockedGODToken={`${Number(props.lockedNFTSerialId) ? 1 : 0}`}
          totalGODTokenBalance={props.totalGODTokenBalance}
          availableGODTokenBalance={props.availableGODTokenBalance}
          hidePendingStatus
          isLoading={props.isLoading}
        />
      </HStack>
      {Number(props.lockedNFTSerialId) ? (
        <>
          {!isUnlockButtonEnabled ? (
            <Flex minWidth="20rem" maxWidth="30rem" alignSelf="center">
              <InlineAlert message={warningMessage} type={InlineAlertType.Warning} />
            </Flex>
          ) : (
            <FormInput
              inputProps={{
                id: "unlockNFTSerialId",
                value: `${props.lockedNFTSerialId}` ?? "",
                isDisabled: true,
                label: "Locked NFT Serial Id:",
                type: "text",
                placeholder: "Enter amount",
              }}
            />
          )}
          <Button
            variant="primary"
            type="submit"
            isDisabled={!props.canUserClaimGODTokens}
            leftIcon={<UnlockIcon />}
            onClick={props.form.handleSubmit(props.onUnlockButtonClick)}
          >
            {`Unlock Locked ${props.tokenSymbol}`}
          </Button>
        </>
      ) : (
        <>
          <FormDropdown
            label="NFT ID"
            placeholder="Select a token serial number"
            data={props.tokenNFTs.map((input: any) => {
              return {
                label: input.serial_number,
                value: input.serial_number,
              };
            })}
            isInvalid={Boolean(errors?.lockNFTSerialId)}
            errorMessage={errors?.lockNFTSerialId && errors?.lockNFTSerialId.message}
            register={register("lockNFTSerialId", {
              onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("lockNFTSerialId", e.target.value),
            })}
          />
          <Button
            variant="primary"
            type="submit"
            isDisabled={isEmpty(props.form.getValues().lockNFTSerialId)}
            leftIcon={<LockIcon />}
            onClick={props.form.handleSubmit(props.onLockButtonClick)}
          >
            Lock 1 {props.tokenSymbol}
          </Button>
        </>
      )}
    </Flex>
  );
}

export interface ManageVotingPowerProps {
  tokenNFTs: MirrorNodeTokenNFT[];
  tokenSymbol: string;
  errorMessage?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  lockedNFTSerialId?: number;
  totalGODTokenBalance: string;
  totalGODTokenBalanceValue?: string;
  availableGODTokenBalance: string;
  availableGODTokenBalanceValue?: string;
  hidePendingStatus?: boolean;
  isSubmitButtonDisabled?: boolean;
  canUserClaimGODTokens?: boolean;
  onErrorMessageDismiss?: () => void | undefined;
  onClose?: () => void | undefined;
  onLockClick: (data: InputTokenData) => void;
  onUnlockClick: () => void;
}

export const ManageVotingPower = (props: ManageVotingPowerProps) => {
  const [dialogsOpenState, setDialogsOpenState] = useState(false);

  const manageGovTokenForm = useForm<InputTokenData>({
    defaultValues: {
      lockNFTSerialId: "",
    },
  });

  manageGovTokenForm.watch(["lockNFTSerialId"]);

  function handleLockButtonClick(data: InputTokenData) {
    props.onLockClick(data);
    setDialogsOpenState(false);
  }

  function handleUnLockButtonClick() {
    props.onUnlockClick();
    setDialogsOpenState(false);
  }

  return (
    <form>
      <AlertDialog
        title={`Manage ${props.tokenSymbol} token`}
        size={["xl", "xxl"]}
        dialogWidth="unset"
        openModalComponent={
          <Button
            key="manage-gov"
            variant="secondary"
            padding="0 0.5rem"
            width="6.5rem"
            leftIcon={<TwoLayerSettingsIcon />}
          >
            <Text.P_Small_Semibold>Manage</Text.P_Small_Semibold>
          </Button>
        }
        openDialogButtonText="Manage"
        body={
          <ManageVotingPowerModalBody
            tokenSymbol={props.tokenSymbol}
            tokenNFTs={props.tokenNFTs}
            isLoading={props.isLoading}
            lockedNFTSerialId={props.lockedNFTSerialId}
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
