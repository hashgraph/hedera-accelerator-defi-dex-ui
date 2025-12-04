import { Card, Flex, Image, Text, Badge } from "@chakra-ui/react";
import { useTheme, DefaultLogoIcon } from "@shared/ui-kit";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DAOType } from "@dao/services";
import { useFetchContract } from "@dao/hooks";

export interface DAOCardProps {
  accountEVMAddress: string;
  name: string;
  type: DAOType;
  logoUrl: string;
  isPrivate?: boolean;
}

export function DAOCard(props: DAOCardProps) {
  const { name, type, accountEVMAddress, logoUrl, isPrivate } = props;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;
  const isFromMyDAOs = searchParams.get("filter") === "myDAOs";

  function handleDAOCardClicked() {
    const daoTypePath = type.toLowerCase().replaceAll(" ", "-");
    const fromParam = isFromMyDAOs ? "?from=myDAOs" : "";
    navigate(`${daoTypePath}/${daoAccountId}${fromParam}`);
  }

  return (
    <Card
      variant="dao-card"
      onClick={handleDAOCardClicked}
      cursor="pointer"
      bg={theme.bgCard}
      border={`1px solid ${theme.border}`}
      borderRadius="16px"
      padding={{ base: "0.5rem", md: "0.65rem" }}
      transition="all 0.3s ease-in-out"
      _hover={{
        bg: theme.bgCardHover,
        borderColor: theme.borderHover,
        transform: "translateY(-4px)",
        boxShadow: "0 10px 40px rgba(126, 34, 206, 0.15)",
      }}
      position="relative"
      backdropFilter="blur(20px)"
    >
      {isPrivate && (
        <Badge
          position="absolute"
          top="0.75rem"
          right="0.75rem"
          bg="#22D3EE"
          color="white"
          fontSize="10px"
          px="2.5"
          py="1"
          borderRadius="full"
          fontWeight="600"
        >
          Private
        </Badge>
      )}
      <Flex direction="row" align="center" gap={4}>
        <Image
          src={logoUrl}
          objectFit="cover"
          alt="DAO Logo"
          w="64px"
          h="64px"
          borderRadius="12px"
          flexShrink={0}
          fallback={<DefaultLogoIcon boxSize="64px" />}
        />
        <Flex direction="column" gap={1} flex={1} minW={0}>
          <Text fontSize="md" fontWeight="700" color={theme.text} isTruncated>
            {name}
          </Text>
          <Text fontSize="sm" fontWeight="500" color={theme.textMuted}>
            {type}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
