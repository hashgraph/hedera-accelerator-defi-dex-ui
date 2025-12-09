import { modalAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";
import { Color } from "../../themes";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const primary = definePartsStyle({
  header: {
    padding: "1.5rem 2rem",
  },
  overlay: {
    bg: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
  },
  body: {
    padding: "1.5rem 2rem",
  },
  dialog: {
    height: "473px",
    width: "406px",
    bg: Color.White,
    border: `1px solid ${Color.Neutral._100}`,
    borderRadius: "16px",
    boxShadow: Color.Shadow.Strong,
  },
});

const termsConditionModal = definePartsStyle({
  header: {
    padding: "1.25rem",
    borderBottom: `1px solid ${Color.Neutral._100}`,
  },
  overlay: {
    bg: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
  },
  body: {
    marginTop: "1.5rem",
    padding: "0 1.25rem 1.25rem 1.25rem",
  },
  dialog: {
    width: "370px",
    bg: Color.White,
    border: `1px solid ${Color.Neutral._100}`,
    borderRadius: "16px",
    boxShadow: Color.Shadow.Strong,
  },
});

export const ModalStyles = defineMultiStyleConfig({
  variants: { primary, termsConditionModal },
});
