import { ChevronDownIcon } from "@chakra-ui/icons";
import { Image, Text, Button } from "@chakra-ui/react";
import { Color, HederaIcon, DefaultLogoIcon } from "@dex-ui-components";
import { HBARTokenId } from "@services";
import { isEmpty } from "ramda";
import { useFormTokenInputContext } from "./FormTokenInputContext";

export function FormTokenInputSelectTokenButton() {
  const {
    token: { tokenSymbolDisplay, selectedToken },
    modal: { onOpen },
  } = useFormTokenInputContext();

  return (
    <Button
      variant="token-selector"
      key="select-token"
      onClick={onOpen}
      {...(!isEmpty(tokenSymbolDisplay)
        ? {
            leftIcon: (
              <Image
                src={""}
                objectFit="contain"
                alt="Token Logo URL"
                alignSelf="end"
                boxSize="4rem"
                fallback={
                  selectedToken?.tokenId === HBARTokenId ? (
                    <HederaIcon boxSize="6" />
                  ) : (
                    <DefaultLogoIcon boxSize="6" alignSelf="end" color={Color.Grey_Blue._100} />
                  )
                }
              />
            ),
          }
        : {})}
      rightIcon={<ChevronDownIcon w="6" h="6" />}
    >
      <Text textStyle="p medium regular">{tokenSymbolDisplay || "Select Token"}</Text>
    </Button>
  );
}
