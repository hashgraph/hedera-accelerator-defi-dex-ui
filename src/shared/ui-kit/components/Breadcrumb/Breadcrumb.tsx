import { Link } from "@chakra-ui/react";
import { Color } from "../../themes";
import { Link as ReachLink } from "react-router-dom";
import { Text } from "../Text";

interface BreadcrumbProps {
  to: string;
  label: string;
}

// TODO: Change name - this component is not a Breadcrumb
export function Breadcrumb(props: BreadcrumbProps) {
  const { to, label } = props;

  return (
    <Link
      as={ReachLink}
      to={to}
      _hover={{
        textDecoration: "underline",
        textDecorationColor: Color.Primary._500,
      }}
    >
      <Text.P_Medium_Semibold_Link _before={{ content: '"‹ "', fontSize: "20px" }}>{label}</Text.P_Medium_Semibold_Link>
    </Link>
  );
}
