import { Button, Divider, Flex, SimpleGrid, Text, Image, Link, UnorderedList, ListItem } from "@chakra-ui/react";
import { Color, MetricLabel, DefaultLogoIcon } from "@shared/ui-kit";
import { useOutletContext, useNavigate, Link as ReachLink } from "react-router-dom";
import { GovernanceDAODetailsContext } from "./GovernanceDAODashboard/types";
import { DAOFormContainer } from "./CreateADAO/forms/DAOFormContainer";
import { getDAOLinksRecordArray } from "./utils";
import { usePairedWalletDetails } from "@dex/hooks";
import { DAORoutes } from "@dex/routes";

export function DAOSettings() {
  const { dao, FTToken } = useOutletContext<GovernanceDAODetailsContext>();
  const { name, logoUrl, description, webLinks, adminId } = dao;
  const daoLinkRecords = getDAOLinksRecordArray(webLinks);
  const { isWalletPaired, walletId } = usePairedWalletDetails();
  const isAdmin = isWalletPaired && walletId === adminId;
  const navigate = useNavigate();

  function handleChangeDAODetailsClick() {
    navigate(DAORoutes.ChangeDAOSettings);
  }

  return (
    <form id="dao-settings-submit">
      <Flex direction="column" alignItems="center" maxWidth="841px" margin="auto" gap="4" padding="1rem 0">
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text textStyle="p medium medium">Governance</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the governance related DAO properties.
            </Text>
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
                value={dao.votingPeriod}
                valueStyle="p large semibold"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbol="blocks"
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
            <Flex layerStyle="content-box">
              <MetricLabel
                label="LOCKING PERIOD"
                labelTextColor={Color.Neutral._500}
                labelTextStyle="p xsmall medium"
                labelOpacity="1.0"
                value={dao.votingDelay}
                valueStyle="p large semibold"
                valueTextColor={Color.Neutral._900}
                valueUnitSymbol="blocks"
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
                valueUnitSymbol="blocks"
                valueUnitSymbolColor={Color.Neutral._900}
              />
            </Flex>
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer rest={{ gap: 6 }}>
          <Flex direction="column" gap={2}>
            <Text textStyle="p medium medium">General</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the general DAO properties.
            </Text>
            <Divider />
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Name</Text>
            <Text textStyle="p small regular" color={Color.Neutral._700}>
              {name}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Logo URL</Text>
            <Flex direction="row" gap="2" alignItems="center">
              <Image
                src={logoUrl}
                boxSize="4rem"
                objectFit="contain"
                alt="Logo Url"
                fallback={<DefaultLogoIcon boxSize="4rem" color={Color.Grey_Blue._100} />}
              />
              <Link as={ReachLink} textStyle="p small regular link" color={Color.Primary._500} to={logoUrl} isExternal>
                {logoUrl}
              </Link>
            </Flex>
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Description</Text>
            <Text textStyle="p small regular" color={Color.Neutral._700}>
              {description}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">Social Channels</Text>
            <Flex direction="column" gap={2} justifyContent="space-between">
              <UnorderedList>
                {daoLinkRecords.map((link, index) => {
                  return (
                    <ListItem>
                      <Link
                        key={index}
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
