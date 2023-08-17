import { Button } from "@chakra-ui/react";
import { useFormTokenInputContext } from "./FormTokenInputContext";
import { useHalfMaxButtons } from "./useHalfMaxButtons";

export function FormTokenInputHalfMaxButtons() {
  const {
    token: { balanceDisplay, decimals },
    form: { amountFormId, setValue },
  } = useFormTokenInputContext();

  const { handleMaxButtonClicked, handleHalfButtonClicked } = useHalfMaxButtons(
    balanceDisplay,
    decimals ?? "",
    (amount: string | undefined) => setValue(amountFormId, amount)
  );

  return (
    <>
      <Button variant="link" textStyle="p xsmall regular link" onClick={handleHalfButtonClicked}>
        HALF
      </Button>
      <Button variant="link" textStyle="p xsmall regular link" onClick={handleMaxButtonClicked}>
        MAX
      </Button>
    </>
  );
}
