import { Text, Link } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";
import { Link as ReachLink } from "react-router-dom";

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
      <Text textStyle="p medium semibold link" _before={{ content: '"‹ "', fontSize: "20px" }}>
        {label}
      </Text>
    </Link>
  );
}
