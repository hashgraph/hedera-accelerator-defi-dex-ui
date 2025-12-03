import { Button, Divider, Flex, SimpleGrid, IconButton, Image, Link, UnorderedList, ListItem } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Text, RefreshIcon, Color, Tag, CopyTextButton, DefaultLogoIcon, ExternalLink, useTheme } from "@shared/ui-kit";
import * as R from "ramda";
import { MultiSigDAODetailsContext } from "./types";
import { Member } from "@dao/services";
import { DAOFormContainer } from "../CreateADAO/forms/DAOFormContainer";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { getDAOLinksRecordArray } from "../utils";
import { Link as ReachLink } from "react-router-dom";
import { usePairedWalletDetails } from "@dex/hooks";
import { Routes } from "@dao/routes/routes";
import { RemoveMemberLocationState, ReplaceMemberLocationState } from "../DAOProposals";

const { Multisig, DAOAddMemberDetails, DAODeleteMemberDetails, DAOReplaceMemberDetails, DAOUpgradeThresholdDetails } =
  Routes;

export function Settings() {
  const theme = useTheme();
  const { accountId: daoAccountId = "" } = useParams();
  const navigate = useNavigate();
  const { dao, members } = useOutletContext<MultiSigDAODetailsContext>();
  const { name, logoUrl, description, webLinks, adminId, threshold, infoUrl } = dao;
  const adminIndex = members?.findIndex((member) => member.accountId === adminId);
  const { isWalletPaired, walletId } = usePairedWalletDetails();
  const isAdmin = isWalletPaired && walletId === dao.adminId;
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const membersWithAdminFirst: Member[] = R.swap(0, adminIndex, members);
  const daoLinkRecords = getDAOLinksRecordArray(webLinks);

  function handleCopyMemberId() {
    console.log("copy text to clipboard");
  }

  function handleAddNewMemberClicked() {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAOAddMemberDetails}`);
  }

  function handleDeleteMemberClick(memberId: string) {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAODeleteMemberDetails}`, {
      state: { memberId },
    } as RemoveMemberLocationState);
  }

  function handleReplaceMemberClick(memberId: string) {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAOReplaceMemberDetails}`, {
      state: { memberId },
    } as ReplaceMemberLocationState);
  }

  function handleChangeThresholdClick() {
    navigate(`/${Multisig}/${daoAccountId}/new-proposal/${DAOUpgradeThresholdDetails}`);
  }

  function handleChangeDAODetailsClick() {
    navigate(Routes.ChangeDAOSettings);
  }

  return (
    <form id="dao-settings-submit">
      <Flex direction="column" alignItems="center" maxWidth="841px" margin="auto" gap="4" padding="1rem 0">
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text.P_Medium_Medium color={theme.text}>Members</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={theme.textSecondary}>
              Manage the member preferences, add, remove or rename them.
            </Text.P_Small_Regular>
            <Divider borderColor={theme.border} />
          </Flex>
          <Flex direction="row" alignItems="center" marginBottom="0.4rem" justifyContent="space-between">
            <Text.P_Small_Regular color={theme.text}>{members.length} Members</Text.P_Small_Regular>
            <Button type="button" variant="primary" onClick={handleAddNewMemberClicked}>
              + Add Member
            </Button>
          </Flex>
          <SimpleGrid minWidth="100%" columns={1} spacingX="2rem" spacingY="1.2rem">
            {membersWithAdminFirst?.map((member, index) => {
              const { accountId } = member;
              const isAdminTag = accountId === adminId;
              return (
                <Flex
                  key={index}
                  direction="row"
                  bg={theme.bgSecondary}
                  justifyContent="space-between"
                  alignItems="center"
                  padding="0.5rem"
                  borderRadius="8px"
                >
                  <Flex direction="row" gap="2" alignItems="center">
                    <Text.P_Small_Regular color={theme.textSecondary}>{accountId}</Text.P_Small_Regular>
                    <CopyTextButton onClick={handleCopyMemberId} iconSize="17" />
                    {isAdminTag ? <Tag label="Admin" /> : <></>}
                  </Flex>
                  <Flex direction="row" gap="4" alignItems="center" height="20px">
                    {!isAdminTag ? (
                      <IconButton
                        size="xs"
                        variant="link"
                        aria-label="refresh-member"
                        onClick={() => handleReplaceMemberClick(member.accountId)}
                        icon={<RefreshIcon boxSize="17" color={theme.accentLight} />}
                      />
                    ) : undefined}
                    {!isAdminTag ? (
                      <IconButton
                        size="xs"
                        onClick={() => handleDeleteMemberClick(member.accountId)}
                        variant="link"
                        aria-label="delete-member-id"
                        icon={<DeleteIcon color={theme.error} boxSize="17" />}
                      />
                    ) : undefined}
                  </Flex>
                </Flex>
              );
            })}
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text.P_Medium_Medium color={theme.text}>Governance</Text.P_Medium_Medium>
            <Text.P_Small_Regular marginBottom="0.7rem" color={theme.textSecondary}>
              Manage the governance related DAO properties.
            </Text.P_Small_Regular>
            <Divider borderColor={theme.border} />
          </Flex>
          <SimpleGrid minWidth="100%" columns={2} spacingX="2rem" spacingY="1.2rem">
            <Flex
              direction="column"
              bg={theme.bgSecondary}
              justifyContent="space-between"
              border={`1px solid ${theme.border}`}
              borderRadius="12px"
              padding="1.5rem"
            >
              <Flex direction="row" justifyContent="space-between" alignItems="center">
                <Flex direction="column" gap="1">
                  <Text.P_XSmall_Medium color={theme.textMuted}>THRESHOLD</Text.P_XSmall_Medium>
                  <Text.P_Large_Medium color={theme.text}>
                    {`${threshold ?? 0} / ${members.length}`}
                  </Text.P_Large_Medium>
                </Flex>
                <Button
                  type="button"
                  variant="primary"
                  padding="10px 10px"
                  height="40px"
                  onClick={handleChangeThresholdClick}
                >
                  Change
                </Button>
              </Flex>
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
                        key={index}
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
