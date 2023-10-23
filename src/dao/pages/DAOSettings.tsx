import { Button, Divider, Flex, SimpleGrid, Image, Link, UnorderedList, ListItem } from "@chakra-ui/react";
import { Text, Color, MetricLabel, DefaultLogoIcon, ExternalLink } from "@shared/ui-kit";
import { useOutletContext, useNavigate, Link as ReachLink } from "react-router-dom";
import { GovernanceDAODetailsContext } from "./GovernanceDAODashboard/types";
import { DAOFormContainer } from "./CreateADAO/forms/DAOFormContainer";
import { getDAOLinksRecordArray, shortEnglishHumanizer } from "./utils";
import { usePairedWalletDetails } from "@dex/hooks";
import { Routes } from "@dao/routes";

export function DAOSettings() {
  const { dao, FTToken } = useOutletContext<GovernanceDAODetailsContext>();
  const { name, logoUrl, description, webLinks, adminId, infoUrl } = dao;
  const daoLinkRecords = getDAOLinksRecordArray(webLinks);
  const { isWalletPaired, walletId } = usePairedWalletDetails();
  const isAdmin = isWalletPaired && walletId === adminId;
  const navigate = useNavigate();

  function handleChangeDAODetailsClick() {
    navigate(Routes.ChangeDAOSettings);
  }

  return (
    <form id="dao-settings-submit">
      <Flex direction="column" alignItems="center" maxWidth="841px" margin="auto" gap="4" padding="1rem 0">
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text.P_Medium_Medium>Governance</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the governance related DAO properties.
            </Text.P_Small_Regular>
            <Divider />
          </Flex>
          <SimpleGrid minWidth="100%" columns={2} spacing="1rem">
            <Flex layerStyle="content-box">
              <MetricLabel
                label="MINIMUM PROPOSAL DEPOSIT"
                labelTextColor={Color.Neutral._500}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={dao.minimumProposalDeposit ?? 0}
                valueStyle="p large medium"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbol={FTToken?.data.symbol}
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
            <Flex layerStyle="content-box">
              <MetricLabel
                label="QUORUM"
                labelTextColor={Color.Neutral._500}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={dao.quorumThreshold ?? 0}
                valueStyle="p large medium"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbol="%"
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
            <Flex layerStyle="content-box">
              <MetricLabel
                label="VOTING DURATION"
                labelTextColor={Color.Neutral._500}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={shortEnglishHumanizer(dao.votingPeriod * 1000)}
                valueStyle="p large semibold"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
            <Flex layerStyle="content-box">
              <MetricLabel
                label="LOCKING PERIOD"
                labelTextColor={Color.Neutral._500}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={shortEnglishHumanizer(dao.votingDelay * 1000)}
                valueStyle="p large semibold"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
            <Flex layerStyle="content-box">
              <MetricLabel
                label="Vault locking period"
                labelTextColor={Color.Neutral._500}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value="1, 7, 30"
                valueStyle="p large semibold"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbol="Secs"
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer rest={{ gap: 6 }}>
          <Flex direction="column" gap={2}>
            <Text.P_Medium_Medium>General</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the general DAO properties.
            </Text.P_Small_Regular>
            <Divider />
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Name</Text.P_Small_Medium>
            <Text.P_Small_Regular color={Color.Neutral._700}>{name}</Text.P_Small_Regular>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Logo URL</Text.P_Small_Medium>
            <Flex direction="row" gap="2" alignItems="center">
              <Image
                src={logoUrl}
                boxSize="4rem"
                objectFit="contain"
                alt="Logo Url"
                fallback={<DefaultLogoIcon boxSize="4rem" color={Color.Grey_Blue._100} />}
              />
              <Link
                as={ReachLink}
                textStyle="p small regular link"
                color={Color.Primary._500}
                to={logoUrl}
                isExternal
                flexWrap="wrap"
                maxWidth="90%"
              >
                {logoUrl}
              </Link>
            </Flex>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Description</Text.P_Small_Medium>
            <Text.P_Small_Regular color={Color.Neutral._700}>{description}</Text.P_Small_Regular>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>INFO URL</Text.P_Small_Medium>
            <ExternalLink to={infoUrl ?? ""}>
              <Text.P_Small_Semibold_Link>{infoUrl}</Text.P_Small_Semibold_Link>
            </ExternalLink>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium>Social Channels</Text.P_Small_Medium>
            <Flex direction="column" gap={2} justifyContent="space-between">
              <UnorderedList>
                {daoLinkRecords.map((link, index) => {
                  return (
                    <ListItem key={index}>
                      <Link
                        key={link.value}
                        as={ReachLink}
                        textStyle="p small regular link"
                        color={Color.Primary._500}
                        to={link.value}
                        isExternal
                      >
                        {link.value}
                      </Link>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </Flex>
          </Flex>
          {isAdmin ? (
            <Flex alignItems="flex-end" gap="1rem" direction="column">
              <Divider />
              <Button
                type="button"
                variant="primary"
                padding="10px 15px"
                height="40px"
                onClick={handleChangeDAODetailsClick}
              >
                Change
              </Button>
            </Flex>
          ) : undefined}
        </DAOFormContainer>
      </Flex>
    </form>
  );
}
