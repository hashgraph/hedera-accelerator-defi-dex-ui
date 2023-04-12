import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, Text, Flex } from "@chakra-ui/react";
import { createHashScanLink } from "../../../dex-ui/utils";
import { Color } from "../../themes";

export enum HashscanData {
  Account = "Account",
  Token = "Token",
  Transaction = "Transaction",
}

interface HashScanLinkProps {
  id: string;
  type: HashscanData;
}

export function HashScanLink(props: HashScanLinkProps) {
  const { id, type } = props;
  if (!id) return null;

  const hashscanLink = createHashScanLink(id, type);

  return (
    <Flex direction="row">
      <Text textStyle="p small regular">{id}</Text>
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
