import { Select } from "@chakra-ui/react";

const TokenSelector = (props: any) => {
  const { value, onChangeHandler, tokenPairs } = props;
  return (
    <Select value={value} onChange={onChangeHandler} placeholder="Select a Token">
      {tokenPairs !== null &&
        tokenPairs.map((token: any) => {
          return (
            <>
              <option
                key={token.tokenA.symbol}
                value={token.tokenA.symbol}>
                {token.tokenA.symbol}
              </option>
              <option
                key={token.tokenA.symbol}
                value={token.tokenB.symbol}>
                {token.tokenB.symbol}
              </option>
            </>
          );
        })}
    </Select>
  );
};

export { TokenSelector };
