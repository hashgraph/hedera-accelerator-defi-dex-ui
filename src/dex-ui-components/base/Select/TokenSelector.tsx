import { Select } from "@chakra-ui/react";
import { TOKEN_A_SYMBOL, TOKEN_B_SYMBOL } from "../../TokenInput/constants";

const TokenSelector = (props: any) => {
  const { value, onChangeHandler, tokenPairs } = props;

  return (
    <Select value={value} onChange={onChangeHandler} placeholder="Select a Token">
      <option value="HBAR">HBAR</option>
      <option value={TOKEN_A_SYMBOL}>{TOKEN_A_SYMBOL}</option>
      {tokenPairs !== null &&
        tokenPairs.map((token: any) => {
          return (
            <option key={token.tokenId} value={token.symbol}>
              {token.symbol}
            </option>
          );
        })}
      <option value={TOKEN_B_SYMBOL}>{TOKEN_B_SYMBOL}</option>
    </Select>
  );
};

export { TokenSelector };
