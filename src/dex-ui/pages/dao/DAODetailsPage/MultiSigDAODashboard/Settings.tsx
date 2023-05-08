import { Button, Divider, Flex, SimpleGrid, Tag, Text, IconButton, Image } from "@chakra-ui/react";
import { CopyIcon, DeleteIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { FormInput, RefreshIcon, Color } from "@dex-ui-components";
import * as R from "ramda";
import { Member } from "./MultiSigDAODashboard";
import { MultiSigDAODetails } from "@services";
import { DAOFormContainer } from "../../CreateADAO/forms/DAOFormContainer";
import { isValidUrl } from "@pages";
import { useNavigate } from "react-router-dom";
import { Paths } from "@routes";

interface SettingsProps {
  daoDetails: MultiSigDAODetails;
}

export type MultiSigDaoSettingForm = MultiSigDAODetails;

export function Settings(props: SettingsProps) {
  const navigate = useNavigate();
  const {
    daoDetails: { adminId, ownerIds, threshold },
  } = props;
  const members: Member[] = [adminId, ...ownerIds].map((ownerId: string) => ({
    name: "-",
    logo: "",
    accountId: ownerId,
  }));

  const multiSigDaoSettingsForm = useForm<MultiSigDaoSettingForm>({
    defaultValues: {
      ...props.daoDetails,
    },
  });

  function onSubmit(data: MultiSigDAODetails) {
    console.log("Details", data);
  }

  function handleAddNewMemberClicked() {
    navigate(Paths.DAOs.AddNewMember, {
      state: {
        ...props.daoDetails,
      },
    });
  }

  function handleDeleteMemberClick(member: string) {
    navigate(Paths.DAOs.RemoveMember, {
      state: {
        ...props.daoDetails,
        memberId: member,
      },
    });
  }

  function handleReplaceMemberClick(member: string) {
    navigate(Paths.DAOs.ReplaceMember, {
      state: {
        ...props.daoDetails,
        memberId: member,
      },
    });
  }

  function handleChangeThresholdClick() {
    navigate(Paths.DAOs.ChangeThreshold, {
      state: {
        ...props.daoDetails,
      },
    });
  }

  const {
    getValues,
    handleSubmit,
    register,
    formState: { errors },
  } = multiSigDaoSettingsForm;

  const { logoUrl } = getValues();

  const memberCount = members.length;
  const adminIndex = members?.findIndex((member) => member.accountId === adminId);
  // @ts-ignore - @types/ramda has not yet been updated with a type for R.swap
  const membersWithAdminFirst: Member[] = R.swap(0, adminIndex, members);
  return (
    <form id="dao-settings-submit">
      <Flex direction="column" alignItems="center" maxWidth="841px" margin="auto" gap="8" paddingTop="2rem">
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text textStyle="p medium medium">Members</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the member preferences, add, remove or rename them.
            </Text>
            <Divider />
          </Flex>
          <Flex direction="row" alignItems="center" marginBottom="0.4rem" justifyContent="space-between">
            <Text textStyle="p small regular">{memberCount} Members</Text>
            <Button variant="primary" onClick={handleAddNewMemberClicked}>
              + Add Member
            </Button>
          </Flex>
          <SimpleGrid minWidth="100%" columns={1} spacingX="2rem" spacingY="1.2rem">
            {membersWithAdminFirst?.map((member) => {
              const { accountId } = member;
              const isAdmin = accountId === adminId;
              return (
                <Flex direction="row" bg={Color.White_02} justifyContent="space-between" alignItems="center">
                  <Flex direction="row" gap="2" alignItems="center">
                    <Text textStyle="p small regular" color={Color.Neutral._500}>
                      {accountId}
                    </Text>
                    <IconButton
                      size="xs"
                      variant="link"
                      aria-label="copy-member-id"
                      fontSize="17px"
                      icon={<CopyIcon color={Color.Neutral._500} />}
                    />
                    {isAdmin ? (
                      <Tag textStyle="p small medium" color={Color.Grey_Blue._500}>
                        Admin
                      </Tag>
                    ) : (
                      <></>
                    )}
                  </Flex>
                  <Flex direction="row" gap="4" alignItems="center" height="20px">
                    <IconButton
                      size="xs"
                      variant="link"
                      aria-label="refresh-member"
                      fontSize="17px"
                      onClick={() => handleReplaceMemberClick(member.accountId)}
                      icon={<RefreshIcon />}
                    />
                    {!isAdmin ? (
                      <IconButton
                        size="xs"
                        onClick={() => handleDeleteMemberClick(member.accountId)}
                        variant="link"
                        aria-label="delete-member-id"
                        fontSize="17px"
                        icon={<DeleteIcon color={Color.Teal_01} />}
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
            <Text textStyle="p medium medium">Governance</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the governance related DAO properties.
            </Text>
            <Divider />
          </Flex>
          <SimpleGrid minWidth="100%" columns={2} spacingX="2rem" spacingY="1.2rem">
            <Flex
              direction="column"
              bg={Color.White_02}
              justifyContent="space-between"
              border={`1px solid ${Color.Neutral._200}`}
              borderRadius="4px"
              padding="1.5rem"
            >
              <Flex direction="row" justifyContent="space-between" alignItems="center">
                <Flex direction="column" gap="1">
                  <Text textStyle="p xsmall medium" color={Color.Neutral._500}>
                    THRESHOLD
                  </Text>
                  <Text textStyle="p large medium">{`${threshold} / ${memberCount}`}</Text>
                </Flex>
                <Button
                  type="submit"
                  variant="primary"
                  padding="10px 10px"
                  height="40px"
                  onClick={() => handleChangeThresholdClick()}
                >
                  Change
                </Button>
              </Flex>
            </Flex>
          </SimpleGrid>
        </DAOFormContainer>
        <DAOFormContainer>
          <Flex direction="column" gap={2} marginBottom="0.4rem">
            <Text textStyle="p medium medium">General</Text>
            <Text textStyle="p small regular" marginBottom="0.7rem" color={Color.Neutral._500}>
              Manage the general DAO properties.
            </Text>
            <Divider />
          </Flex>
          <FormInput<"name">
            inputProps={{
              id: "name",
              label: "Name",
              type: "text",
              placeholder: "Enter the name of your DAO",
              register: {
                ...register("name", {
                  required: { value: true, message: "A name is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.name)}
            errorMessage={errors.name && errors.name.message}
          />
          <Flex direction="row" alignItems="center" gap="10">
            <FormInput<"logoUrl">
              inputProps={{
                id: "logoUrl",
                label: "Logo URL",
                type: "text",
                placeholder: "Enter the logo url of your DAO",
                register: {
                  ...register("logoUrl", {
                    validate: (value) => isValidUrl(value) || "Enter a Valid URL.",
                  }),
                },
              }}
              isInvalid={Boolean(errors.logoUrl)}
              errorMessage={errors.logoUrl && errors.logoUrl.message}
            />
            {isValidUrl(logoUrl) ? <Image src={logoUrl} boxSize="64px" objectFit="cover" alt="Logo Url" /> : undefined}
          </Flex>
          <Divider marginBottom="0.4rem" />
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            variant="primary"
            padding="10px 10px"
            height="40px"
            width="123px"
          >
            Save Changes
          </Button>
        </DAOFormContainer>
      </Flex>
    </form>
  );
}
