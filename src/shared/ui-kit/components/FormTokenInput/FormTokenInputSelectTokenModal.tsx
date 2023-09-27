import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Flex,
  Text,
  Divider,
  ModalBody,
  InputGroup,
  InputLeftElement,
  Input,
  List,
  ListItem,
  Image,
} from "@chakra-ui/react";
import { Color } from "../../themes";
import { HederaIcon, DefaultLogoIcon } from "../Icons";
import { useInput, TokenBalance, useAccountTokenBalances } from "@dex/hooks";
import { isEmpty, isNil } from "ramda";
import { FixedSizeList } from "react-window";
import { useFormTokenInputContext } from "./FormTokenInputContext";
import { useEffect } from "react";
import { HBARTokenId } from "@dex/services";

export function FormTokenInputSelectTokenModal() {
  const {
    form: { tokenFormId, setValue },
    token: { assetListAccountId, initialSelectedTokenId, selectedToken, setSelectedToken },
    modal: { isOpen, onClose },
  } = useFormTokenInputContext();

  const { value: searchTokensInput, handleChange: handleSearchTokensInputChanged } = useInput("");
  const tokensQueryResults = useAccountTokenBalances(assetListAccountId, { textSearch: searchTokensInput });
  const { data: tokens = [] } = tokensQueryResults;
  const fungibleTokens = tokens.filter((token) => !token.isNFT);

  useEffect(() => {
    if (!isEmpty(initialSelectedTokenId) || !isNil(initialSelectedTokenId)) {
      const selectedTokenData = fungibleTokens?.find((asset: TokenBalance) => asset.tokenId === initialSelectedTokenId);
      setSelectedToken(selectedTokenData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedTokenId]);

  function handleTokenClicked(currentToken: TokenBalance) {
    const { tokenId } = currentToken;
    setValue(tokenFormId, tokenId);
    const selectedTokenData =
      isEmpty(tokenId) || isNil(tokenId)
        ? undefined
        : fungibleTokens?.find((asset: TokenBalance) => asset.tokenId === tokenId);
    setSelectedToken(selectedTokenData);
    onClose();
  }

  interface TokenListItemProps {
    index: number;
  }

  function TokenListItem(props: TokenListItemProps) {
    const { index } = props;
    const { name, symbol, tokenId } = fungibleTokens[index];

    return (
      <ListItem
        bg={tokenId === selectedToken?.tokenId ? Color.Blue._100 : Color.White}
        onClick={() => handleTokenClicked(fungibleTokens[index])}
      >
        <Flex direction="row" alignItems="center" gap="2">
          <Image
            /** TODO: Add URL to fetch token logos */
            src={""}
            objectFit="contain"
            alt="Token Logo"
            alignSelf="end"
            boxSize="4rem"
            fallback={
              tokenId === HBARTokenId ? (
                <HederaIcon boxSize="9" />
              ) : (
                <DefaultLogoIcon boxSize="9" color={Color.Grey_Blue._100} />
              )
            }
          />
          <Flex direction="column">
            <Text textStyle="p medium semibold">{name}</Text>
            <Text textStyle="p xsmall regular" color={Color.Neutral._500}>
              {symbol}
            </Text>
          </Flex>
        </Flex>
      </ListItem>
    );
  }

  return (
    <Modal variant="primary" isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <Text textStyle="p large semibold">Select Token</Text>
            <CloseIcon w="3" h="3" onClick={onClose} cursor="pointer" />
          </Flex>
        </ModalHeader>
        <Divider />
        <ModalBody>
          <InputGroup>
            <InputLeftElement>
              <SearchIcon />
            </InputLeftElement>
            <Input
              variant="input-v2"
              marginBottom="1rem"
              value={searchTokensInput}
              onChange={handleSearchTokensInputChanged}
              placeholder="Search tokens"
              minWidth="100%"
            />
          </InputGroup>
          {isEmpty(fungibleTokens) ? (
            <Flex alignItems="center" justifyContent="center" width="100%" height="100%" maxHeight="296px">
              <Text textStyle="p medium semibold">No results found.</Text>
            </Flex>
          ) : (
            <List variant="select-token-list">
              <FixedSizeList height={296} itemCount={fungibleTokens.length} itemSize={64} width="100%">
                {({ index }) => <TokenListItem key={index} index={index} />}
              </FixedSizeList>
            </List>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
