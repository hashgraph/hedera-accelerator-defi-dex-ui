import { ChangeEvent, cloneElement } from "react";
import { Select } from "@chakra-ui/react";
import { TokenPairs } from "../../TokenInput/types";

interface TokenSelectorProps {
  value: string | undefined;
  tokenPairs: TokenPairs[] | null;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const TokenSelector = (props: TokenSelectorProps) => {
  const { value, onChangeHandler, tokenPairs } = props;
  return cloneElement(
    <Select value={value} placeholder="Select a Token">
      {tokenPairs !== null &&
        tokenPairs.map((token: TokenPairs) => {
          return (
            <>
              <option key={token.tokenMeta.tokenId} value={token.symbol}>
                {token.symbol}
              </option>
            </>
          );
        })}
    </Select>,
    onChangeHandler ? { onChange: onChangeHandler } : {}
  );
};

export { TokenSelector };
