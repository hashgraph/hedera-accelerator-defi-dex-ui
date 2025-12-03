import { Button, Divider, Flex, SimpleGrid, Image, Link, UnorderedList, ListItem } from "@chakra-ui/react";
import { Text, MetricLabel, DefaultLogoIcon, ExternalLink, useTheme } from "@shared/ui-kit";
import { useOutletContext, useNavigate, Link as ReachLink } from "react-router-dom";
import { GovernanceDAODetailsContext } from "./GovernanceDAODashboard/types";
import { DAOFormContainer } from "./CreateADAO/forms/DAOFormContainer";
import { getDAOLinksRecordArray, shortEnglishHumanizer } from "./utils";
import { usePairedWalletDetails } from "@dex/hooks";
import { Routes } from "@dao/routes";

export function DAOSettings() {
  const theme = useTheme();
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
            <Text.P_Medium_Medium color={theme.text}>Governance</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={theme.textSecondary}>
              Manage the governance related DAO properties.
            </Text.P_Small_Regular>
            <Divider borderColor={theme.border} />
          </Flex>
          <SimpleGrid minWidth="100%" columns={2} spacing="1rem">
            <Flex bg={theme.bgSecondary} border={`1px solid ${theme.border}`} borderRadius="8px" padding="1rem">
              <MetricLabel
                label="MINIMUM PROPOSAL DEPOSIT"
                labelTextColor={theme.textMuted}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={dao.minimumProposalDeposit ?? 0}
                valueStyle="p large medium"
                valueTextColor={theme.text}
                valueUnitSymbol={FTToken?.data.symbol}
                valueUnitSymbolColor={theme.text}
              />
            </Flex>
            <Flex bg={theme.bgSecondary} border={`1px solid ${theme.border}`} borderRadius="8px" padding="1rem">
              <MetricLabel
                label="QUORUM"
                labelTextColor={theme.textMuted}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={dao.quorumThreshold ?? 0}
                valueStyle="p large medium"
                valueTextColor={theme.text}
                valueUnitSymbol="%"
                valueUnitSymbolColor={theme.text}
              />
            </Flex>
            <Flex bg={theme.bgSecondary} border={`1px solid ${theme.border}`} borderRadius="8px" padding="1rem">
              <MetricLabel
                label="VOTING DURATION"
                labelTextColor={theme.textMuted}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={shortEnglishHumanizer(dao.votingPeriod * 1000)}
                valueStyle="p large semibold"
                valueTextColor={theme.text}
                valueUnitSymbolColor={theme.text}
              />
            </Flex>
            <Flex bg={theme.bgSecondary} border={`1px solid ${theme.border}`} borderRadius="8px" padding="1rem">
              <MetricLabel
                label="LOCKING PERIOD"
                labelTextColor={theme.textMuted}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={shortEnglishHumanizer(dao.votingDelay * 1000)}
                valueStyle="p large semibold"
                valueTextColor={theme.text}
                valueUnitSymbolColor={theme.text}
              />
            </Flex>
            <Flex bg={theme.bgSecondary} border={`1px solid ${theme.border}`} borderRadius="8px" padding="1rem">
              <MetricLabel
                label="Vault locking period"
                labelTextColor={theme.textMuted}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value="1, 7, 30"
                valueStyle="p large semibold"
                valueTextColor={theme.text}
                valueUnitSymbol="Secs"
                valueUnitSymbolColor={theme.text}
              />
            </Flex>
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer rest={{ gap: 6 }}>
          <Flex direction="column" gap={2}>
            <Text.P_Medium_Medium color={theme.text}>General</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={theme.textSecondary}>
              Manage the general DAO properties.
            </Text.P_Small_Regular>
            <Divider borderColor={theme.border} />
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium color={theme.text}>Name</Text.P_Small_Medium>
            <Text.P_Small_Regular color={theme.textSecondary}>{name}</Text.P_Small_Regular>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium color={theme.text}>Logo URL</Text.P_Small_Medium>
            <Flex direction="row" gap="2" alignItems="center">
              <Image
                src={logoUrl}
                boxSize="4rem"
                objectFit="contain"
                alt="Logo Url"
                fallback={<DefaultLogoIcon boxSize="4rem" color={theme.textMuted} />}
              />
              <Link
                as={ReachLink}
                textStyle="p small regular link"
                color={theme.accentLight}
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
            <Text.P_Small_Medium color={theme.text}>Description</Text.P_Small_Medium>
            <Text.P_Small_Regular color={theme.textSecondary}>{description}</Text.P_Small_Regular>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium color={theme.text}>INFO URL</Text.P_Small_Medium>
            <ExternalLink to={infoUrl ?? ""}>
              <Text.P_Small_Semibold_Link color={theme.accentLight}>{infoUrl}</Text.P_Small_Semibold_Link>
            </ExternalLink>
          </Flex>
          <Flex direction="column" gap="1">
            <Text.P_Small_Medium color={theme.text}>Social Channels</Text.P_Small_Medium>
            <Flex direction="column" gap={2} justifyContent="space-between">
              <UnorderedList color={theme.textSecondary}>
                {daoLinkRecords.map((link, index) => {
                  return (
                    <ListItem key={index}>
                      <Link
                        key={link.value}
                        as={ReachLink}
                        textStyle="p small regular link"
                        color={theme.accentLight}
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
              <Divider borderColor={theme.border} />
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
