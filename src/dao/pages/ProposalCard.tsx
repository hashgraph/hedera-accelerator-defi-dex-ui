import { Divider, Flex, Image } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatTokenAmountWithDecimal, getShortDescription, replaceLastRoute } from "@dex/utils";
import { Card, Color, DefaultLogoIcon, HederaIcon, SendTokenIcon, Tag, TagVariant, Text } from "@shared/ui-kit";
import { DAO, DAOType } from "@dao/services";
import { ProposalStateAsTagVariant, ProposalStatusAsTagVariant } from "./constants";
import { DAOProposalVoting } from "./DAOProposalVoting";
import { Proposal, ProposalType } from "@dao/hooks";
import { Routes } from "@dao/routes";
import { ProposalState } from "@dex/store";
import { getProposalData } from "./utils";
import { isFungible, isNFT } from "shared";

interface ProposalCardProps {
  proposal: Proposal;
  dao: DAO;
  showTitle?: boolean;
  showTypeTag?: boolean;
}

export const ProposalCard = (props: ProposalCardProps) => {
  const { proposal, dao, showTitle, showTypeTag } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const isMultiSig = dao.type === DAOType.MultiSig;
  const isGovernanceOrNFT = dao.type === DAOType.GovernanceToken || dao.type === DAOType.NFT;
  const timeRemaining = "";
  const votingEndTime = "";
  const { amount, token, transactionHash, proposalId } = proposal;
  const getLabel = (proposal: Proposal) => {
    if (proposal.proposalState === ProposalState.Canceled) {
      return ProposalState.Canceled;
    }
    return proposal.status;
  };

  const tokenSymbol = token?.data.symbol;
  const RightContent = () => (
    <Flex gap="4" alignItems="center">
      {!isMultiSig && (
        <>
          {timeRemaining ? (
            <Text.P_Small_Regular color={Color.Neutral._400}>{`${timeRemaining} left`}</Text.P_Small_Regular>
          ) : (
            <>
              {votingEndTime && (
                <Text.P_Small_Regular
                  color={Color.Neutral._400}
                >{`voting ended on ${votingEndTime}`}</Text.P_Small_Regular>
              )}
            </>
          )}
        </>
      )}
      {showTypeTag ? <Tag variant={TagVariant.Secondary} label={`${dao.type} DAO`} /> : <></>}
      <Tag variant={TagVariant.Primary} label={proposal.type} />
      {isMultiSig && proposal.status ? (
        <Tag variant={ProposalStatusAsTagVariant[proposal.status]} label={proposal.status} />
      ) : proposal.proposalState ? (
        <Tag variant={ProposalStateAsTagVariant[proposal.proposalState]} label={getLabel(proposal)} />
      ) : (
        <></>
      )}
    </Flex>
  );

  const goToProposalDetails = () => {
    if (transactionHash) {
      navigate(replaceLastRoute(location.pathname, `${Routes.Proposals}/${transactionHash}`));
    } else if (proposalId) {
      navigate(replaceLastRoute(location.pathname, `${Routes.Proposals}/${proposalId}`));
    }
  };

  return (
    <Card onClick={goToProposalDetails} cursor="pointer" _hover={{ bg: Color.Neutral._100 }}>
      <Flex direction="column">
        {showTitle && (
          <>
            <Flex alignItems="center" justifyContent="space-between">
              <Flex gap="4" alignItems="center">
                <Image
                  src={dao.logoUrl}
                  boxSize="2rem"
                  objectFit="contain"
                  alt="Logo Url"
                  fallback={<DefaultLogoIcon boxSize="2rem" color={Color.Grey_Blue._100} />}
                />
                <Text.P_Medium_Semibold color={Color.Neutral._900}>{dao.name}</Text.P_Medium_Semibold>
              </Flex>
              <RightContent />
            </Flex>
            <Divider marginY="1rem" />
          </>
        )}
        <Flex justifyContent="space-between">
          <Flex direction="column" alignItems="flex-start" gap={2}>
            <Text.P_Medium_Semibold color={Color.Grey_Blue._800} textOverflow="ellipsis" whiteSpace="nowrap">
              {proposal.title}
            </Text.P_Medium_Semibold>
            <Text.P_Small_Regular color={Color.Neutral._700} textAlign="start">
              {getShortDescription(proposal.description)}
            </Text.P_Small_Regular>
            {proposal.link && proposal.type !== ProposalType.TokenTransfer && (
              <Text.P_Small_Regular color={Color.Grey_Blue._400} textAlign="start">
                {proposal.link}
              </Text.P_Small_Regular>
            )}
            {isMultiSig && (
              <>
                {proposal.type === ProposalType.TokenTransfer && (
                  <Flex alignItems="center">
                    <HederaIcon />
                    <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
                    <Text.P_Medium_Regular color={Color.Neutral._900} textAlign="start">
                      {isFungible(token?.data.type) &&
                        `${formatTokenAmountWithDecimal(amount, Number(token?.data.decimals ?? 0))} ${tokenSymbol}`}
                      {isNFT(token?.data.type) &&
                        ` ${tokenSymbol} ${formatTokenAmountWithDecimal(amount, Number(token?.data.decimals ?? 0))}`}
                    </Text.P_Medium_Regular>
                  </Flex>
                )}
                <Text.P_Small_Regular color={Color.Neutral._900} textAlign="start">
                  {getProposalData(proposal)}
                </Text.P_Small_Regular>
              </>
            )}
            {isGovernanceOrNFT && (
              <>
                {proposal.type === ProposalType.TokenTransfer && (
                  <Flex alignItems="center">
                    <HederaIcon />
                    <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
                    <Text.P_Medium_Regular color={Color.Neutral._900} textAlign="start">
                      {isFungible(token?.data.type) &&
                        `${formatTokenAmountWithDecimal(amount, Number(token?.data.decimals ?? 0))} ${tokenSymbol}`}
                      {isNFT(token?.data.type) &&
                        ` ${tokenSymbol} ${formatTokenAmountWithDecimal(amount, Number(token?.data.decimals ?? 0))}`}
                    </Text.P_Medium_Regular>
                  </Flex>
                )}
                <Text.P_Small_Regular color={Color.Neutral._900} textAlign="start">
                  {getProposalData(proposal)}
                </Text.P_Small_Regular>
              </>
            )}
          </Flex>
          <Flex direction="column" gap={4} alignItems="flex-end">
            {!showTitle && <RightContent />}
            <Flex gap={4}>
              {proposal.author && (
                <Text.P_Small_Regular
                  color={Color.Neutral._400}
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >{`Author ${proposal.author.toString()}`}</Text.P_Small_Regular>
              )}
              <DAOProposalVoting proposal={proposal} dao={dao} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
