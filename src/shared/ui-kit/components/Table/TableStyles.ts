import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { Color } from "../../themes";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tableAnatomy.keys);

const baseStyle = definePartsStyle({
  th: {
    textTransform: "none",
  },
  td: {
    borderBottom: `1px solid ${Color.Neutral._200}`,
  },
});

export const TableStyles = defineMultiStyleConfig({
  baseStyle,
});
