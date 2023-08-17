import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, Text, Flex } from "@chakra-ui/react";
import { createHashScanLink } from "../../../../dex/utils";
import { Color } from "../../themes";

export enum HashscanData {
  Account = "Account",
  Token = "Token",
  Transaction = "Transaction",
}

interface HashScanLinkProps {
  id: string;
  type: HashscanData;
  withParentheses?: boolean;
}

export function HashScanLink(props: HashScanLinkProps) {
  const { id, type, withParentheses } = props;
  if (!id) return null;

  const hashscanLink = createHashScanLink(id, type);

  return (
    <Flex direction="row" alignItems="center">
      <Text textStyle={`p small ${withParentheses ? "parentheses" : "regular"}`}>{id}</Text>
      <Link
        width="fit-content"
        display="flex"
        alignItems="center"
        padding="0 0.25rem"
        color={Color.Neutral._400}
        href={hashscanLink}
        isExternal={true}
      >
        <ExternalLinkIcon margin="0rem 0.125rem" />
      </Link>
    </Flex>
  );
}
