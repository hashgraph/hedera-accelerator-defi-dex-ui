import { useLocation } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { Color } from "../../themes/color";

export function BreadcrumbText() {
  const location = useLocation();
  const crumb = location.pathname
    .split("/")
    .filter((crumb) => crumb !== "")
    .join(" / ");

  return (
    <Text textStyle="p small medium" color={Color.Neutral._500}>
      {crumb}
    </Text>
  );
}
