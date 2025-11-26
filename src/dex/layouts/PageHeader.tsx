import { Spacer, Flex, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";

interface PageHeaderProps {
  leftContent: ReactNode[];
  rightContent: ReactNode[];
}

export function PageHeader(props: PageHeaderProps) {
  const padding = useBreakpointValue({
    base: "16px 1rem 12px",
    sm: "20px 1.5rem 14px",
    md: "24px 2rem 16px",
    lg: "24px 3rem 16px",
    xl: "24px 5rem 16px",
  });

  const height = useBreakpointValue({
    base: "auto",
    md: "88px",
  });

  const direction = useBreakpointValue({
    base: "column" as const,
    sm: "row" as const,
  });

  const gap = useBreakpointValue({
    base: 3,
    sm: 4,
  });

  return (
    <Flex
      direction={direction}
      alignItems={{ base: "flex-start", sm: "center" }}
      justifyContent={{ base: "flex-start", sm: "space-between" }}
      padding={padding}
      minHeight={height}
      gap={gap}
      flexWrap="wrap"
    >
      {props.leftContent}
      <Spacer display={{ base: "none", sm: "block" }} />
      {props.rightContent}
    </Flex>
  );
}
