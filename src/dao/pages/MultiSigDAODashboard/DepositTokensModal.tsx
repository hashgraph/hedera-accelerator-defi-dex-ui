import { Button, Divider, Flex, Tab, TabList, Tabs } from "@chakra-ui/react";
import { Color, FormDropdown, FormTokenInput, InlineAlert, InlineAlertType, NewTokenIcon, Text } from "@shared/ui-kit";
import { useAccountTokenBalances, usePairedWalletDetails, useTabFilters, useTokenNFTs } from "@dex/hooks";
import { useForm } from "react-hook-form";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { ChangeEvent } from "react";
import { DepositTokenModalTabs } from "./types";

interface DepositTokensModalBodyProps {
  safeId: string;
  handleDepositClicked: (data: DepositTokensFormData) => void;
  handleCancelClicked: () => void;
  handleAssociateTokenClicked: () => void;
}

export interface DepositTokensFormData {
  tokenId: string;
  amount: string | undefined;
  decimals: number;
  nftSerialId: number;
}

export function DepositTokensModal(props: DepositTokensModalBodyProps) {
  const { safeId, handleDepositClicked, handleCancelClicked, handleAssociateTokenClicked } = props;
  const { tabIndex, handleTabChange } = useTabFilters(0);
  const { walletId } = usePairedWalletDetails();
  const form = useForm<DepositTokensFormData>();
  const {
    handleSubmit,
    getValues,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const tokensQueryResults = useAccountTokenBalances(safeId);
  const { data: tokens = [] } = tokensQueryResults;
  const { amount = "", tokenId = "" } = getValues();
  const { data: tokenNFTs = [], isLoading } = useTokenNFTs(tokenId);
  watch("tokenId");

  async function onSubmit(data: DepositTokensFormData) {
    handleDepositClicked(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap={4}>
        <Divider marginX={-5} paddingX={5} />
        {tokens.filter((token) => token.isNFT).length > 0 && (
          <Tabs isFitted onChange={handleTabChange} index={tabIndex} variant="dao-create-new" width="100%">
            <DAOFormContainer rest={{ padding: "0.1rem" }}>
              <TabList>
                <Tab>Token</Tab>
                <Tab>NFT</Tab>
              </TabList>
            </DAOFormContainer>
          </Tabs>
        )}
        {tabIndex === DepositTokenModalTabs.Fungible ? (
          <>
            <FormTokenInput
              amountFormId="amount"
              tokenFormId="tokenId"
              assetListAccountId={safeId}
              balanceAccountId={walletId ?? ""}
              currentAmount={amount}
              form={form}
              isInvalid={Boolean(errors?.amount)}
              errorMessage={errors?.amount && errors?.amount?.message}
            />
            <Flex justify="space-around" gap={4}>
              <Text.P_XSmall_Regular>
                If you can&apos;t find the token you want to deposit, create a proposal
              </Text.P_XSmall_Regular>
              <Button
                variant="secondary"
                onClick={handleAssociateTokenClicked}
                paddingX={4}
                leftIcon={<NewTokenIcon boxSize="4" color={Color.Neutral._400} marginTop="0.2rem" />}
                flexShrink={0}
              >
                Associate Token
              </Button>
            </Flex>
          </>
        ) : (
          <Flex direction="column" gap={4}>
            <FormDropdown
              label="NFT"
              placeholder="Select a NFT"
              data={tokens
                .filter((token) => token.isNFT)
                .map((input) => {
                  return {
                    label: input.name,
                    value: input.tokenId,
                  };
                })}
              isInvalid={Boolean(errors?.tokenId)}
              errorMessage={errors.tokenId && errors.tokenId.message}
              register={register("tokenId", {
                required: { value: true, message: "A token is required" },
                onChange: (e: ChangeEvent<HTMLSelectElement>) => {
                  setValue("tokenId", e.target.value);
                  setValue("nftSerialId", 0);
                },
              })}
            />
            <FormDropdown
              label="NFT Serial Number"
              placeholder="Select a serial number"
              data={tokenNFTs.map((input: any) => {
                return {
                  label: input.serial_number,
                  value: input.serial_number,
                };
              })}
              isInvalid={Boolean(errors?.nftSerialId)}
              errorMessage={errors.nftSerialId && errors.nftSerialId.message}
              register={register("nftSerialId", {
                required: { value: true, message: "A token is required to be locked to create proposal" },
                onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("nftSerialId", Number(e.target.value)),
              })}
            />
            {tokenId && !isLoading && tokenNFTs.length === 0 && (
              <InlineAlert
                type={InlineAlertType.Warning}
                message={`There are no tokens present in the connect wallet`}
              />
            )}
          </Flex>
        )}
        <Flex>
          <InlineAlert
            type={InlineAlertType.Error}
            message={
              "Be mindful of depositing governance tokens into the DAO's treasury. " +
              "Tokens in treasury cannot be used for voting on proposals and may prevent the ability to reach quorum."
            }
          />
        </Flex>
        <Flex gap="4" backgroundColor={Color.Grey_Blue._50} marginX={-5} padding={5} marginBottom={-10}>
          <Button flex="1" variant="secondary" onClick={handleCancelClicked}>
            Cancel
          </Button>
          <Button flex="1" type="submit">
            Deposit Fund
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
