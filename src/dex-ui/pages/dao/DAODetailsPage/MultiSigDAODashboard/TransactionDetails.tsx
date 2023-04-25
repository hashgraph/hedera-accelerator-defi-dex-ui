import { Text, Flex, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";
import BigNumber from "bignumber.js";
import { Transaction } from "@hooks";
interface TransactionDetailsProps extends Transaction {
  threshold: number;
  index: number;
}

export function TransactionDetails(props: TransactionDetailsProps) {
  const { nonce, to, approvals, threshold, type, timestamp, status, amount, token } = props;
  const amountDisplay = BigNumber(amount)
    .shiftedBy(-Number(token?.data?.decimals ?? 0))
    .toString();
  return (
    <AccordionItem
      key={props.index}
      borderRadius="0.5rem"
      marginBottom="1rem"
      background={Color.White_02}
      border={`1px solid ${Color.Neutral._200}`}
    >
      <h2>
        <AccordionButton alignContent="space-between" textAlign="left" height="3.5rem">
          <Flex flex="1" alignItems="center" gap="4">
            <Text textStyle="p medium regular">{nonce}</Text>
            <Text textStyle="p medium regular">
              {amountDisplay} {token?.data?.symbol}
            </Text>
          </Flex>
          <Text flex="1" textStyle="p medium regular">
            {type}
          </Text>
          <Text flex="1" textStyle="p medium regular">
            {status}
          </Text>
          <Text flex="1" textStyle="p medium regular">
            {timestamp}
          </Text>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel>
        <Flex direction="column">
          <Text flex="1" textStyle="p medium regular">
            to: {to}
          </Text>
          <Text flex="1" textStyle="p medium regular">
            Approvals: {approvals}/{threshold}
          </Text>
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  );
}
