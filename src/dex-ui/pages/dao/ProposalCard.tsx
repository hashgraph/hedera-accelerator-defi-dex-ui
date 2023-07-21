import { Text, Flex, Image, Divider } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatTokenAmountWithDecimal, getShortDescription, replaceLastRoute } from "@utils";
import { Tag, Card, Color, TagVariant, SendTokenIcon, HederaIcon, DefaultLogoIcon } from "@dex-ui-components";
import { DAO, DAOType } from "@services";
import { ProposalStatusAsTagVariant } from "./constants";
import { DAOProposalVoting } from "./DAOProposalVoting";
import { Proposal, ProposalType } from "@hooks";
import { Paths } from "@routes";

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
  const isGovernance = dao.type === DAOType.GovernanceToken;
  const timeRemaining = "";
  const votingEndTime = "";
  const { amount, token, transactionHash, proposalId } = proposal;

  const tokenSymbol = token?.data.symbol;
  const RightContent = () => (
    <Flex gap="4" alignItems="center">
      {!isMultiSig && (
        <>
          {timeRemaining ? (
            <Text textStyle="p small regular" color={Color.Neutral._400}>{`${timeRemaining} left`}</Text>
          ) : (
            <>
              {votingEndTime && (
                <Text textStyle="p small regular" color={Color.Neutral._400}>{`voting ended on ${votingEndTime}`}</Text>
              )}
            </>
          )}
        </>
      )}
      {showTypeTag ? <Tag variant={TagVariant.Secondary} label={`${dao.type} DAO`} /> : <></>}
      <Tag variant={TagVariant.Primary} label={proposal.type} />
      {proposal.status ? <Tag variant={ProposalStatusAsTagVariant[proposal.status]} label={proposal.status} /> : <></>}
    </Flex>
  );

  const goToProposalDetails = () => {
    if (transactionHash) {
      navigate(replaceLastRoute(location.pathname, `${Paths.DAOs.Proposals}/${transactionHash}`));
    } else if (proposalId) {
      navigate(replaceLastRoute(location.pathname, `${Paths.DAOs.Proposals}/${proposalId}`));
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
                <Text textStyle="p medium semibold" color={Color.Neutral._900}>
                  {dao.name}
                </Text>
              </Flex>
              <RightContent />
            </Flex>
            <Divider marginY="1rem" />
          </>
        )}
        <Flex justifyContent="space-between">
          <Flex direction="column" alignItems="flex-start" gap={2}>
            <Text
              textStyle="p medium semibold"
              color={Color.Grey_Blue._800}
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {proposal.title}
            </Text>
            <Text textStyle="p small regular" color={Color.Neutral._700} textAlign="start">
              {getShortDescription(proposal.description)}
            </Text>
            {proposal.link && proposal.type !== ProposalType.TokenTransfer && (
              <Text textStyle="p small regular" color={Color.Grey_Blue._400} textAlign="start">
                {proposal.link}
              </Text>
            )}
            {isMultiSig && (
              <>
                {proposal.type === ProposalType.TokenTransfer && (
                  <Flex alignItems="center">
                    <HederaIcon />
                    <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
                    <Text textStyle="p medium regular" color={Color.Neutral._900} textAlign="start">
                      {formatTokenAmountWithDecimal(amount, Number(token?.data.decimals))} {tokenSymbol}
                    </Text>
                  </Flex>
                )}
                {proposal.type === ProposalType.AddNewMember && (
                  <Text textStyle="p small regular" color={Color.Neutral._900} textAlign="start">
                    {`Max proposal confirmations will increase by 1.`}
                  </Text>
                )}
                {proposal.type === ProposalType.RemoveMember && (
                  <Text textStyle="p small regular" color={Color.Neutral._900} textAlign="start">
                    {`Max proposal confirmations will decrease by 1.`}
                  </Text>
                )}
                {proposal.type === ProposalType.ReplaceMember && (
                  <Text textStyle="p small regular" color={Color.Neutral._900} textAlign="start">
                    {`Required proposal threshold confirmations will be updated.`}
                  </Text>
                )}
                {proposal.type === ProposalType.ChangeThreshold && (
                  <Text textStyle="p small regular" color={Color.Neutral._900} textAlign="start">
                    {`Required proposal threshold confirmations will be updated.`}
                  </Text>
                )}
                {proposal.type === ProposalType.TokenAssociate && (
                  <Text textStyle="p small regular" color={Color.Neutral._900} textAlign="start">
                    {`Associate Token: ${proposal.tokenToAssociate}`}
                  </Text>
                )}
              </>
            )}
            {isGovernance && (
              <>
                {proposal.type === ProposalType.TokenTransfer && (
                  <Flex alignItems="center">
                    <HederaIcon />
                    <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
                    <Text textStyle="p medium regular" color={Color.Neutral._900} textAlign="start">
                      {formatTokenAmountWithDecimal(amount, Number(token?.data.decimals ?? 0))} {tokenSymbol}
                    </Text>
                  </Flex>
                )}
              </>
            )}
          </Flex>
          <Flex direction="column" gap={4} alignItems="flex-end">
            {!showTitle && <RightContent />}
            <Flex gap={4}>
              {proposal.author && (
                <Text
                  textStyle="p small regular"
                  color={Color.Neutral._400}
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >{`Author ${proposal.author.toString()}`}</Text>
              )}
              <DAOProposalVoting proposal={proposal} dao={dao} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
