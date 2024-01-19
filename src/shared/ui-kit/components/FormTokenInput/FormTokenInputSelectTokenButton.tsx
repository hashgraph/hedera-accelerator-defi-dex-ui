import { ChevronDownIcon } from "@chakra-ui/icons";
import { Button, Image } from "@chakra-ui/react";
import { Color } from "../../themes";
import { DefaultLogoIcon, HederaIcon } from "../Icons";
import { HBARTokenId } from "@dex/services";
import { isEmpty } from "ramda";
import { useFormTokenInputContext } from "./FormTokenInputContext";
import { Text } from "../Text";

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
      <Text.P_Medium_Regular>{tokenSymbolDisplay || "Select Token"}</Text.P_Medium_Regular>
    </Button>
  );
}
