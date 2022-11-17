import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Circle,
  Flex,
  Spacer,
  Text,
  useRadioGroup,
  VStack,
} from "@chakra-ui/react";
import { useRef } from "react";
import { Link as ReachLink, useNavigate } from "react-router-dom";
import { RadioCard } from "../../../dex-ui-components";

// interface SelectProposalType {}

const mockNewProposalOptions = [
  {
    name: "new-token",
    type: "New Token",
    iconColor: "#FFC400",
    description: "Text proposals are for lorem ipsum dolor sit",
  },
  {
    name: "text",
    type: "Text",
    iconColor: "#6DC3D1",
    description: "Text proposals are for lorem ipsum dolor sit",
  },
  {
    name: "token-transfer",
    type: "Token Transfer",
    iconColor: "#EDC1C1",
    description: "Text proposals are for lorem ipsum dolor sit",
  },
  {
    name: "contract-upgrade",
    type: "Contract Upgrade",
    iconColor: "#2CB997",
    description: "Text proposals are for lorem ipsum dolor sit",
  },
];

export const SelectProposalType = (props: any) => {
  const selectedProposalType = useRef<string>("new-token");
  const navigate = useNavigate();

  const handleProposalSelectionChange = (event: any) => {
    selectedProposalType.current = event;
  };

  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: "new-token",
    onChange: handleProposalSelectionChange,
  });

  const group = getRootProps();
  return (
    <VStack alignItems="left" width="100%">
      <Breadcrumb flex="1">
        <BreadcrumbItem>
          <BreadcrumbLink as={ReachLink} to="/governance">
            <Text textStyle="link">{"< Governance"}</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text flex="1" textStyle="h2" paddingBottom="3rem">
        Create New Proposal
      </Text>
      <Center flexDirection="column" alignItems="center">
        <Text textStyle="h3">What kind of proposal is this?</Text>
        <Spacer padding="1.5rem" />
        <Flex direction="row" gap={6} {...group}>
          {mockNewProposalOptions.map((option, index) => {
            const radio = getRadioProps({ value: option.name });
            return (
              <RadioCard key={index} {...radio} flex="1" padding="0.75rem">
                <Center flexDirection="column">
                  <Text textStyle="h4">{option.type}</Text>
                  <Spacer padding="0.5rem" />
                  <Circle size="3em" bg={option.iconColor} />
                  <Spacer padding="0.5rem" />
                  <Text textStyle="b2-medium">{option.description}</Text>
                  <Spacer padding="0.25rem" />
                </Center>
              </RadioCard>
            );
          })}
        </Flex>
        <Spacer padding="3rem" />
        <Button
          width="437px"
          onClick={() =>
            navigate(`/governance/select-proposal-type/${selectedProposalType.current}`)
          }
        >
          Continue
        </Button>
        <Spacer padding="0.25rem" />
        <Button variant="cancel" width="437px" onClick={() => navigate(`/governance`)}>
          Cancel
        </Button>
      </Center>
    </VStack>
  );
};
