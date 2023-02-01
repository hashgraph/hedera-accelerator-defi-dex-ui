import { Text, Flex, Grid, GridItem } from "@chakra-ui/react";
import { Color } from "../..";
interface TokenInputLayoutProps {
  title: React.ReactNode;
  tokenAmountInput: React.ReactNode;
  tokenSymbolSelector: React.ReactNode;
  halfAndMaxButtons?: React.ReactNode;
  userTokenBalance: React.ReactNode;
}

export function TokenInputLayout(props: TokenInputLayoutProps) {
  return (
    <Grid templateColumns="repeat(5, 1fr)">
      <GridItem colSpan={5} marginBottom="0.25rem">
        {props.title}
      </GridItem>
      <GridItem colSpan={3}>{props.tokenAmountInput}</GridItem>
      <GridItem colSpan={2}>{props.tokenSymbolSelector}</GridItem>
      <GridItem colSpan={5} bg={Color.Grey_01} padding="0.5rem">
        <Flex direction="row">
          <Text textStyle="h4">Balance:&nbsp;</Text>
          {props.userTokenBalance}
          {props.halfAndMaxButtons}
        </Flex>
      </GridItem>
    </Grid>
  );
}
