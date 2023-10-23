import { Flex, Link, ListItem, UnorderedList, Image } from "@chakra-ui/react";
import { Text, Color, CopyTextButton, DefaultLogoIcon, FormInput, ExternalLink } from "@shared/ui-kit";
import { useDexContext } from "@dex/hooks";
import { useFormContext } from "react-hook-form";
import { SettingsForm } from "./types";
import { Link as ReachLink } from "react-router-dom";

export function UpdateDAODetailsReviewForm() {
  const { getValues } = useFormContext<SettingsForm>();
  const { name, description, logoUrl, webLinks, infoUrl } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";

  function handleCopyMemberId(address: string) {
    console.log("Copy Member Address", address);
  }

  return (
    <Flex gap="1.3rem" direction="column">
      <Flex direction="row" flex="7" alignItems="top" gap="0.8rem">
        <Flex flex="1" alignItems="top">
          <Image
            src={logoUrl}
            objectFit="contain"
            borderRadius="full"
            alt="DAO Logo URl"
            boxSize="4rem"
            fallback={<DefaultLogoIcon boxSize="4rem" color={Color.Grey_Blue._100} />}
          />
        </Flex>
        <Flex direction="column" flex="6" gap="1rem" alignItems="start">
          <FormInput<"name">
            inputProps={{
              id: "name",
              label: "Name",
              type: "text",
              value: name,
              isReadOnly: true,
            }}
          />
          <FormInput<"description">
            inputProps={{
              id: "description",
              label: "Description",
              type: "text",
              value: description,
              isReadOnly: true,
            }}
          />
          <Flex direction="column" gap="1">
            <Text.P_XSmall_Medium color={Color.Neutral._500}>Info Url</Text.P_XSmall_Medium>
            <ExternalLink to={infoUrl ?? ""}>
              <Text.P_Small_Semibold_Link>{infoUrl}</Text.P_Small_Semibold_Link>
            </ExternalLink>
          </Flex>
          <Flex direction="column">
            <Text.P_XSmall_Medium color={Color.Neutral._500}>Social Channels</Text.P_XSmall_Medium>
            <Flex direction="column" justifyContent="space-between">
              <UnorderedList>
                {webLinks.map((link, index) => {
                  return (
                    <ListItem key={index}>
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
          <Flex direction="column" gap="0.5rem">
            <Text.P_XSmall_Medium color={Color.Neutral._500}>Submitted By</Text.P_XSmall_Medium>
            <Flex gap="0.5rem" alignItems="center">
              <Text.P_Small_Regular color={Color.Neutral._900}>{walletId}</Text.P_Small_Regular>
              <CopyTextButton onClick={() => handleCopyMemberId(walletId)} iconSize="17" />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
