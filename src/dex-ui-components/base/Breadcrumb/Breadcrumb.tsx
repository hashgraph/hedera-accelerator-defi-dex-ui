import { Text, Breadcrumb as ChakraBreadcrumb, BreadcrumbItem, BreadcrumbLink, As, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

interface BreadcrumbProps {
  to: string;
  as: As | undefined;
  label: string;
  leftIcon?: ReactNode;
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { to, as, label, leftIcon } = props;
  return (
    <ChakraBreadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink as={as} to={to}>
          <Flex direction="row" align="center" gap="2">
            {leftIcon}
            <Text textStyle="p medium semibold link">{label}</Text>
          </Flex>
        </BreadcrumbLink>
      </BreadcrumbItem>
    </ChakraBreadcrumb>
  );
}
