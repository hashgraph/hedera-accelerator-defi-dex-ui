import React from "react";
import { Select } from "@chakra-ui/react";

const TokenSelector = (props: any) => {
  const { value, onChangeHandler } = props;
  return (
    <Select value={value} onChange={onChangeHandler} placeholder="Select a Token">
      <option value="HBAR">HBAR</option>
      <option value="L49A">L49A</option>
      <option value="L49B">L49B</option>
    </Select>
  );
};

export { TokenSelector };
