import { useLocation } from "react-router-dom";
import { Color } from "../../themes";
import { Text } from "../Text";

export function BreadcrumbText() {
  const location = useLocation();
  const crumb = location.pathname
    .split("/")
    .filter((crumb) => crumb !== "")
    .join(" / ");

  return <Text.P_Small_Medium color={Color.Neutral._500}>{crumb}</Text.P_Small_Medium>;
}
