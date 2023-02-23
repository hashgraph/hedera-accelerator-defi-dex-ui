import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type PageBodyProps = PropsWithChildren;

export function PageBody(props: PageBodyProps) {
  return (
    <Box padding="24px 80px 16px" minHeight="100%" maxWidth="1440px">
      {props.children}
    </Box>
  );
}
