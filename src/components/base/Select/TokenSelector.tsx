import React from "react";
import { Select } from "@chakra-ui/react";

const TokenSelector = (props: any) => {
  return (
    <Select placeholder="Select a Token">
      <option value="option1">HBAR</option>
      <option value="option2">L49A</option>
      <option value="option3">L49B</option>
    </Select>
  );
};

export { TokenSelector };
