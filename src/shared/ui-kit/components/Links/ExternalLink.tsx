import { Link as ReachLink } from "react-router-dom";
import { Link } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

interface ExternalLinkProps extends PropsWithChildren {
  to: string;
}

export function ExternalLink(props: ExternalLinkProps) {
  const { to, children } = props;
  return (
    <Link as={ReachLink} to={to} isExternal>
      {children}
    </Link>
  );
}
