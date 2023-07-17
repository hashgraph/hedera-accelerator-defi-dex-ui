import { Image, Card, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { Color, DefaultLogoIcon } from "@dex-ui-components";
import { MultiSigDAODetailsContext } from "./MultiSigDAODashboard/types";
import { useNavigate, useOutletContext } from "react-router-dom";

interface ProposalTemplate {
  name: string;
  logoURL: string;
  metadata: string;
  ipfsURL: string;
}

export function TemplatesList() {
  const { dao } = useOutletContext<MultiSigDAODetailsContext>();
  const navigate = useNavigate();
  const templates: ProposalTemplate[] = [
    {
      name: "HIP",
      logoURL: "",
      metadata: "",
      ipfsURL: "",
    },
  ];
  const templatesCount = templates.length;

  function handleTemplateCardClicked() {
    navigate(`proposal-template-editor`);
  }

  return (
    <>
      <Flex layerStyle="dao-dashboard__content-header">
        <Text textStyle="p medium medium">{templatesCount} Proposal Templates</Text>
      </Flex>
      <Flex direction="row" layerStyle="dao-dashboard__content-body">
        <SimpleGrid minWidth="100%" columns={3} spacingX="2rem" spacingY="2rem">
          {templates?.map((template, index) => {
            const { name, logoURL, metadata, ipfsURL } = template;
            return (
              <Card
                variant="dao-card"
                onClick={handleTemplateCardClicked}
                cursor="pointer"
                _hover={{ bg: Color.Neutral._100 }}
              >
                <Flex
                  key={index}
                  direction="row"
                  bg={Color.White_02}
                  border={`1px solid ${Color.Neutral._200}`}
                  borderRadius="4px"
                  gap="4"
                  padding="1.5rem"
                  alignItems="center"
                >
                  <Image
                    src={logoURL}
                    objectFit="contain"
                    alt="DAO Logo URL"
                    boxSize="3.5rem"
                    fallback={<DefaultLogoIcon boxSize="3.5rem" color={Color.Grey_Blue._100} />}
                  />
                  <Text textStyle="b1" isTruncated>
                    {name}
                  </Text>
                </Flex>
              </Card>
            );
          })}
        </SimpleGrid>
      </Flex>
    </>
  );
}
