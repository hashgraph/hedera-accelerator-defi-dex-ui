import { defineStyle, defineStyleConfig } from "@chakra-ui/react";
import { Color } from "../../themes";

const toastLink = defineStyle({
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  color: Color.Primary._500,
});

const externalLink = defineStyle({
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  padding: "0 0.25rem",
  color: Color.Neutral._400,
});

export const LinkStyles = defineStyleConfig({
  variants: {
    external_link: externalLink,
    toast__link: toastLink,
  },
});
