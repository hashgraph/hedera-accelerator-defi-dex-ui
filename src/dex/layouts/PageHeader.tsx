import { Spacer, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

interface PageHeaderProps {
  leftContent: ReactNode[];
  rightContent: ReactNode[];
}

export function PageHeader(props: PageHeaderProps) {
  return (
    <Flex direction="row" alignItems="center" padding="24px 80px 16px" height="88px">
      {props.leftContent}
      <Spacer />
      {props.rightContent}
    </Flex>
  );
}
