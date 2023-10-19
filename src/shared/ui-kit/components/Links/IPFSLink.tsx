import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, Flex } from "@chakra-ui/react";
import { Text } from "../Text";
import { isCIDValid } from "@dao/utils";
import { Color } from "@shared/ui-kit/themes";

interface HashScanLinkProps {
  gatewayURL: string;
  CID: string;
}

export function IPFSLink(props: HashScanLinkProps) {
  const { gatewayURL, CID } = props;
  if (!isCIDValid(CID)) return null;

  const ipfsLink = `${gatewayURL}/ipfs/${CID}`;

  return (
    <Flex direction="row" alignItems="center">
      <Text.P_Small_Regular color={Color.Neutral._700}>{CID}</Text.P_Small_Regular>
      <Link variant="external_link" href={ipfsLink} isExternal={true}>
        <ExternalLinkIcon margin="0rem 0.125rem" />
      </Link>
    </Flex>
  );
}
