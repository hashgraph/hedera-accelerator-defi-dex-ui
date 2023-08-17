import { ChangeEvent, cloneElement } from "react";
import { Select } from "@chakra-ui/react";
import { Token } from "../TokenInput/types";
import { UseFormRegisterReturn } from "react-hook-form";
import { ArrowDropDownIcon } from "..";
import { isEmpty } from "ramda";

interface TokenSelectorProps {
  /* The unique Account ID of the token */
  value?: string | undefined;
  tokenPairs: Token[] | null;
  selectControls?: UseFormRegisterReturn<any>;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const TokenSelector = (props: TokenSelectorProps) => {
  const { value, onChangeHandler, tokenPairs } = props;
  return cloneElement(
    <Select
      variant="tokenSymbolSelector"
      value={isEmpty(value) ? undefined : value}
      placeholder="Select Token"
      icon={<ArrowDropDownIcon />}
      {...props.selectControls}
    >
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
