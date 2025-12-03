import { Card, Flex, Grid, GridItem, Image, Text, Badge, Box } from "@chakra-ui/react";
import { Color, useTheme, DefaultLogoIcon } from "@shared/ui-kit";
import { useNavigate } from "react-router-dom";
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
  const theme = useTheme();
  const daoAccountIdQueryResults = useFetchContract(accountEVMAddress);
  const daoAccountId = daoAccountIdQueryResults.data?.data.contract_id;

  function handleDAOCardClicked() {
    const daoTypePath = type.toLowerCase().replaceAll(" ", "-");
    navigate(`${daoTypePath}/${daoAccountId}`);
  }

  return (
    <Card
      variant="dao-card"
      onClick={handleDAOCardClicked}
      cursor="pointer"
      bg={theme.bgCard}
      border={`1px solid ${theme.border}`}
      borderRadius="16px"
      padding={{ base: "1rem", md: "1.25rem" }}
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
          bg={theme.accentGradient}
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
        <Box
          w="56px"
          h="56px"
          borderRadius="14px"
          bg="rgba(126, 34, 206, 0.1)"
          border={`1px solid ${theme.border}`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          flexShrink={0}
        >
          <Image
            src={logoUrl}
            objectFit="contain"
            alt="DAO Logo"
            boxSize="40px"
            fallback={
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg="linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="lg" fontWeight="800" color="white">
                  {name.charAt(0).toUpperCase()}
                </Text>
              </Box>
            }
          />
        </Box>
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
