import { useState } from "react";
import { Flex, SimpleGrid, Button } from "@chakra-ui/react";
import { Text, AlertDialog, Color, FormInputList } from "@shared/ui-kit";
import { useFieldArray, useForm } from "react-hook-form";
import { MintNFTTokensFormData } from "./types";
import { MirrorNodeTokenById } from "@dex/services";

export interface MintNFTModalProps {
  token: MirrorNodeTokenById;
  handleMintNFT?: (tokenLinks: string[]) => void;
}
export const MintNFTModal = (props: MintNFTModalProps) => {
  const { token, handleMintNFT } = props;
  const [dialogsOpenState, setDialogsOpenState] = useState(false);
  const defaultFieldValue = { value: "" };
  const maxSupply = Number(token.data.max_supply);
  const totalSupply = Number(token.data.total_supply);

  const mintNFTTokenForm = useForm<MintNFTTokensFormData>({
    defaultValues: {
      tokenLinks: [defaultFieldValue],
    },
  });

  const { control, register, getValues } = mintNFTTokenForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tokenLinks",
  });

  const fieldButtonText = totalSupply + getValues().tokenLinks.length >= maxSupply ? "" : "+ Add New NFT Link";

  mintNFTTokenForm.watch(["tokenLinks"]);

  function handleMintNFTClick() {
    const tokenValues = getValues()
      .tokenLinks.map((tokenLink) => tokenLink.value)
      .filter((v) => v);
    if (handleMintNFT && tokenValues.length > 0) {
      handleMintNFT(tokenValues);
      setDialogsOpenState(false);
    }
  }

  return (
    <form>
      <AlertDialog
        title="Mint NFT Token"
        size={["xl", "xxl"]}
        dialogWidth="623px"
        openModalComponent={
          <Button key="open-mint-nft" variant="primary">
            <Text.P_Small_Semibold color={Color.White_02}>Mint NFT</Text.P_Small_Semibold>
          </Button>
        }
        openDialogButtonText="Mint NFT"
        body={
          <Flex flexDirection="column" height="fit-content" gap="1rem">
            <Flex direction="row" alignItems="baseline" justifyContent="start" flex="2" gap="1">
              <Text.H4_Medium>Token:</Text.H4_Medium>
              <Text.P_Medium_Regular>{token.data.symbol}</Text.P_Medium_Regular>
            </Flex>
            <Flex direction="row" alignItems="baseline" justifyContent="start" flex="2" gap="1">
              <Text.H4_Medium>Max Supply:</Text.H4_Medium>
              <Text.P_Medium_Regular>{maxSupply}</Text.P_Medium_Regular>
            </Flex>
            <Flex direction="row" alignItems="baseline" justifyContent="start" flex="2" gap="1">
              <Text.H4_Medium>Tokens Minted</Text.H4_Medium>
              <Text.P_Medium_Regular>{totalSupply}</Text.P_Medium_Regular>
            </Flex>
            <SimpleGrid row={1} spacingX="1rem" spacingY="0.75rem">
              <FormInputList<MintNFTTokensFormData, "tokenLinks">
                fields={fields}
                defaultFieldValue={defaultFieldValue}
                formPath="tokenLinks"
                fieldPlaceholder="Enter URL"
                fieldLabel=""
                fieldButtonText={fieldButtonText}
                append={append}
                remove={remove}
                register={register}
              />
            </SimpleGrid>
            <Button key="open-mint-nft" variant="primary" onClick={handleMintNFTClick}>
              <Text.P_Small_Semibold color={Color.White_02}>Mint NFT Tokens</Text.P_Small_Semibold>
            </Button>
          </Flex>
        }
        alertDialogOpen={dialogsOpenState}
        onAlertDialogOpen={() => {
          setDialogsOpenState(true);
        }}
        onAlertDialogClose={() => {
          setDialogsOpenState(false);
          mintNFTTokenForm.reset();
        }}
      />
    </form>
  );
};
