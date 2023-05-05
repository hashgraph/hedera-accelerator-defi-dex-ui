import { defineStyleConfig } from "@chakra-ui/react";
import { Color, TextStyles } from "../../themes";

const baseStyle = {
  ...TextStyles.b3,
  bg: Color.White_02,
  padding: "0.5rem",
  border: `1px solid ${Color.Grey_01}`,
  borderRadius: "5px",
  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
  width: "140px",
};

export const TooltipStyles = defineStyleConfig({ baseStyle });
