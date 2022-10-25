import { Select } from "@chakra-ui/react";
import { TOKEN_A_SYMBOL, TOKEN_B_SYMBOL } from "../../TokenInput/constants";

const TokenSelector = (props: any) => {
  const { value, onChangeHandler } = props;
  return (
    <Select value={value} onChange={onChangeHandler} placeholder="Select a Token">
      <option value="HBAR">HBAR</option>
      <option value={TOKEN_A_SYMBOL}>{TOKEN_A_SYMBOL}</option>
      <option value={TOKEN_B_SYMBOL}>{TOKEN_B_SYMBOL}</option>
    </Select>
  );
};

export { TokenSelector };
