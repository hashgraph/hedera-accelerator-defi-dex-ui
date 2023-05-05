import { Text, Flex, Divider, Tag } from "@chakra-ui/react";
import { Card, Color, ProgressBar } from "@dex-ui-components";
import BigNumber from "bignumber.js";
import { Transaction } from "@hooks";
import { useNavigate } from "react-router-dom";

interface TransactionCardProps extends Transaction {
  threshold: number;
  index: number;
}

export function TransactionCard(props: TransactionCardProps) {
  const { transactionHash, nonce, approvalCount, threshold, type, status, amount, token } = props;
  const navigate = useNavigate();

  const tokenSymbol = token?.data.symbol;
  const amountDisplay = BigNumber(amount)
    .shiftedBy(-Number(token?.data?.decimals ?? 0))
    .toString();
  const progressBarValue = approvalCount > 0 ? (approvalCount / threshold) * 100 : 0;

  function handleTransactionCardClicked() {
    navigate(transactionHash);
  }

  return (
    <Card variant="proposal-card" minHeight="99px" onClick={handleTransactionCardClicked}>
      <Flex direction="column" gap="4">
        <Flex direction="row" justifyContent="space-between">
          <Flex direction="row" gap="2" alignItems="center">
            <Text textStyle="p small semibold" marginRight="0.25rem">
              {nonce}
            </Text>
            <Tag textStyle="p small semibold" variant="status">
              {type}
            </Tag>
          </Flex>
          <Tag
            textStyle="p small semibold"
            color={Color.Grey_Blue._700}
            bg={Color.Grey_Blue._100}
            borderRadius="4px"
            padding="6px 16px"
          >
            {status}
          </Tag>
        </Flex>
        <Divider />
        <Flex direction="row" justifyContent="space-between">
          <Text textStyle="p medium regular">
            {amountDisplay} {tokenSymbol}
          </Text>
          <Flex direction="row" bg={Color.Grey_Blue._50} borderRadius="4px" padding="1rem" alignItems="center" gap="4">
            <ProgressBar
              width="6rem"
              height="8px"
              borderRadius="4px"
              value={progressBarValue}
              progressBarColor={Color.Grey_Blue._300}
            />
            <Text textStyle="p medium regular">{`${approvalCount}/${threshold}`}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
