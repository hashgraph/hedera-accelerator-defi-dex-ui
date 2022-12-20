import { ChangeEvent, cloneElement } from "react";
import { Select } from "@chakra-ui/react";
import { Token } from "../../TokenInput/types";

interface TokenSelectorProps {
  /* The unique Account ID of the token */
  value: string | undefined;
  tokenPairs: Token[] | null;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const TokenSelector = (props: TokenSelectorProps) => {
  const { value, onChangeHandler, tokenPairs } = props;
  return cloneElement(
    <Select value={value} placeholder="Select a Token">
      {tokenPairs !== null &&
        tokenPairs.map((token: Token) => {
          return (
            <option key={token.tokenMeta.tokenId} value={token.tokenMeta.tokenId}>
              {token.symbol}
            </option>
          );
        })}
    </Select>,
    onChangeHandler ? { onChange: onChangeHandler } : {}
  );
};

export { TokenSelector };
