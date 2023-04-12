import { Text, SimpleGrid } from "@chakra-ui/react";
import { isEmpty } from "ramda";
import { PropsWithChildren } from "react";
import { UseQueryResult } from "react-query";
import { NotFound } from "./NotFoundLayout";
import { LoadingSpinnerLayout } from "./LoadingSpinnerLayout";

interface CardGridLayoutProps<QueryResultDataType> extends PropsWithChildren {
  columns: number;
  spacingX: string;
  spacingY: string;
  queryResult: UseQueryResult<QueryResultDataType, Error>;
  message: string;
  preLinkText: string;
  linkText: string;
  onLinkClick: () => void;
}

export function CardGridLayout<QueryResultDataType>(props: CardGridLayoutProps<QueryResultDataType>) {
  const { columns, spacingX, spacingY, message, preLinkText, linkText, onLinkClick, queryResult, children } = props;

  if (queryResult.isError) {
    return (
      <Text textStyle="h2_empty_or_error" margin="auto">
        Error: {queryResult.error?.message}
      </Text>
    );
  }

  if (queryResult.isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (queryResult.isSuccess && isEmpty(queryResult.data)) {
    return <NotFound message={message} preLinkText={preLinkText} linkText={linkText} onLinkClick={onLinkClick} />;
  }

  return (
    <SimpleGrid minWidth="100%" columns={columns} spacingX={spacingX} spacingY={spacingY}>
      {children}
    </SimpleGrid>
  );
}
