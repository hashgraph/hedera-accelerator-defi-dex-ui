import { PropsWithChildren, ReactElement } from "react";
import { Text, Skeleton } from "@chakra-ui/react";
import { isEmpty, isNil } from "ramda";

interface CardListProps extends PropsWithChildren {
  error: Error | null;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
}

export function CardList(props: CardListProps): ReactElement {
  const { children, error, isLoading, isError } = props;
  const isListEmpty = isNil(children) || isEmpty(children);

  if (isLoading) {
    return (
      <>
        <Skeleton height="99px" speed={0.4} fadeDuration={0} />
        <Skeleton height="99px" speed={0.4} fadeDuration={0} />
        <Skeleton height="99px" speed={0.4} fadeDuration={0} />
        <Skeleton height="99px" speed={0.4} fadeDuration={0} />
        <Skeleton height="99px" speed={0.4} fadeDuration={0} />
      </>
    );
  }

  if (isError) {
    return (
      <Text textStyle="h2_empty_or_error" margin="auto">
        Error: {error?.message}
      </Text>
    );
  }

  if (isListEmpty) {
    return (
      <Text textStyle="h2_empty_or_error" margin="auto">
        No Proposals Found
      </Text>
    );
  }

  return <>{children}</>;
}
