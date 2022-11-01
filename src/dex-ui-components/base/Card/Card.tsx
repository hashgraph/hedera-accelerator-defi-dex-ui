import { Button, useStyleConfig } from "@chakra-ui/react";

export function Card(props: any) {
  const { variant, children, ...rest } = props;

  const styles = useStyleConfig("Card", { variant });

  // Pass the computed styles into the `__css` prop
  return (
    <Button __css={styles} {...rest}>
      {children}
    </Button>
  );
}
