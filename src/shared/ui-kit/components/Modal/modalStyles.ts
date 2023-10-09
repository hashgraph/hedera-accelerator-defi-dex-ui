import { modalAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";
import { Color } from "../../themes";

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

const termsConditionModal = definePartsStyle({
  header: {
    padding: "1.25rem",
    borderBottom: `1px solid ${Color.Neutral._200}`,
  },
  overlay: {
    bg: "rgba(0, 0, 0, 0.5)",
  },
  body: {
    marginTop: "1.5rem",
    padding: "0 1.25rem 1.25rem 1.25rem",
  },
  dialog: {
    width: "370px",
    border: `1px solid ${Color.Neutral._200}`,
    borderRadius: "2px",
  },
});

export const ModalStyles = defineMultiStyleConfig({
  variants: { primary, termsConditionModal },
});
