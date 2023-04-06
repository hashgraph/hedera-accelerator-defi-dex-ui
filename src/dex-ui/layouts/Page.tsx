import { Grid, GridItem } from "@chakra-ui/react";
import { ReactNode } from "react";
import { PageBody } from "./PageBody";

interface PageProps {
  header?: ReactNode;
  body?: ReactNode;
}

export function Page(props: PageProps) {
  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={8} width="80rem">
      {props.header ? <GridItem colSpan={1}>{props.header}</GridItem> : <></>}
      <GridItem colSpan={1}>
        <PageBody>{props.body}</PageBody>
      </GridItem>
    </Grid>
  );
}
