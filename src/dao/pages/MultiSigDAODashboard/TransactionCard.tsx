import { Flex, Divider } from "@chakra-ui/react";
import { Text, Card, Color, PeopleIcon, ProgressBar, Tag } from "@shared/ui-kit";
import BigNumber from "bignumber.js";
import { Proposal, ProposalStatus } from "@dao/hooks";
import { useNavigate } from "react-router-dom";
import { ProposalStatusAsTagVariant } from "../constants";
interface TransactionCardProps extends Proposal {
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
  const isThresholdReached = approvalCount >= threshold;
  /** TODO: Update contracts to support a "queued" status. */
  const transactionStatus = status === ProposalStatus.Pending && isThresholdReached ? ProposalStatus.Queued : status;

  function handleTransactionCardClicked() {
    transactionHash && navigate(transactionHash);
  }

  return (
    <Card variant="proposal-card" minHeight="99px" onClick={handleTransactionCardClicked}>
      <Flex direction="column" gap="4">
        <Flex direction="row" justifyContent="space-between">
          <Flex direction="row" gap="2" alignItems="center">
            <Text.P_Small_Semibold marginRight="0.25rem">{nonce}</Text.P_Small_Semibold>
            <Tag label={type} />
          </Flex>
          <Tag variant={ProposalStatusAsTagVariant[transactionStatus]} />
        </Flex>
        <Divider />
        <Flex direction="row" justifyContent="space-between">
          <Text.P_Medium_Regular>
            {amountDisplay} {tokenSymbol}
          </Text.P_Medium_Regular>
          <Flex direction="row" bg={Color.Grey_Blue._50} borderRadius="4px" padding="1rem" alignItems="center" gap="4">
            <ProgressBar
              width="6rem"
              height="8px"
              borderRadius="4px"
              value={progressBarValue}
              progressBarColor={Color.Grey_Blue._300}
            />
            <Flex direction="row" alignItems="center" gap="2">
              <Text.P_Small_Semibold>{`${approvalCount}/${threshold}`}</Text.P_Small_Semibold>
              <PeopleIcon boxSize={3.5} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
