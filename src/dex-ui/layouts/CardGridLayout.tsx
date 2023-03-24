import { Text, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { isEmpty } from "ramda";
import { PropsWithChildren } from "react";
import { UseQueryResult } from "react-query";
import { NotFound } from "./NotFoundLayout";

interface CardGridLayoutProps<QueryResultDataType> extends PropsWithChildren {
  queryResult: UseQueryResult<Array<QueryResultDataType>, Error>;
  message: string;
  preLinkText: string;
  linkText: string;
  onLinkClick: () => void;
}

export function CardGridLayout<QueryResultDataType>(props: CardGridLayoutProps<QueryResultDataType>) {
  const { message, preLinkText, linkText, onLinkClick, queryResult, children } = props;

  if (queryResult.isError) {
    return (
      <Text textStyle="h2_empty_or_error" margin="auto">
        Error: {queryResult.error?.message}
      </Text>
    );
  }

  if (queryResult.isLoading) {
    return (
      <SimpleGrid columns={3} spacingX="3rem" spacingY="2rem">
        {[...Array(9)].map(() => (
          <Skeleton height="88px" speed={0.4} fadeDuration={0} />
        ))}
      </SimpleGrid>
    );
  }

  if (queryResult.isSuccess && isEmpty(queryResult.data)) {
    return <NotFound message={message} preLinkText={preLinkText} linkText={linkText} onLinkClick={onLinkClick} />;
  }

  return (
    <SimpleGrid columns={3} spacingX="3rem" spacingY="2rem">
      {children}
    </SimpleGrid>
  );
}
