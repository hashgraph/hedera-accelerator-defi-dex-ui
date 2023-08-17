import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";
import { listAnatomy as parts } from "@chakra-ui/anatomy";
import { Color } from "../../themes";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const selectTokenList = definePartsStyle({
  container: {
    height: "296px",
  },
  item: {
    borderRadius: "0.25rem",
    cursor: "pointer",
    padding: "0.75rem",
    _hover: {
      bg: Color.Neutral._100,
    },
    _selected: {
      bg: Color.Blue._100,
    },
  },
});

export const ListStyles = defineMultiStyleConfig({
  variants: {
    "select-token-list": selectTokenList,
  },
});
