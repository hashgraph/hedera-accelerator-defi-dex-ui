import { modalAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";
import { Color } from "./color";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const primary = definePartsStyle({
  header: {
    padding: "1.5rem 2rem",
  },
  overlay: {
    bg: "rgba(0, 0, 0, 0.5)",
  },
  body: {
    padding: "1.5rem 2rem",
  },
  dialog: {
    height: "473px",
    width: "406px",
    border: `1px solid ${Color.Neutral._200}`,
    borderRadius: "0.25rem",
  },
});

export const ModalStyles = defineMultiStyleConfig({
  variants: { primary },
});
