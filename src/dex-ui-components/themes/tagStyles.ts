import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { Color } from "./";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const status = definePartsStyle({
  container: {
    color: Color.Grey_Blue._700,
    bg: Color.Grey_Blue._100,
    borderRadius: "4px",
    padding: "6px 16px",
  },
});

export const TagStyles = defineMultiStyleConfig({
  variants: {
    status,
  },
});
