import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { Color } from "./color";

const toastLink = defineStyle({
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  color: Color.Primary._500,
});

export const LinkStyles = defineStyleConfig({
  variants: {
    toast__link: toastLink,
  },
});
