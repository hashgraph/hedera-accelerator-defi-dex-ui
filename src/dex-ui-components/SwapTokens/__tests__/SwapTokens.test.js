import { SwapTokens } from "..";
import { render, screen, fireEvent } from "@testing-library/react";
import { mockSwapProps } from "../__fixtures__/swap";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

/*
 * Need to resolve issue with Private.fromString in the swapContract.ts file to
 * enable tests.
 */
describe.skip("Swap UI Component", () => {
  test(
    "US00001 -" +
      "Given: N/A, When: A user loads the Swap component" +
      "Then: The Swap component is visible on the screen.",
    async () => {
      render(<SwapTokens props={mockSwapProps} />);
      expect(screen.getByTestId("swap-component")).toBeInTheDocument();
    }
  );

  test(
    "US00002 -" +
      "Given: The Swap component is loaded" +
      "When: A user interacts with the Swap component" +
      "Then: The user can enter an input and output token amount to swap.",
    async () => {
      render(<SwapTokens props={mockSwapProps} />);
      fireEvent.change(screen.getByTestId("swap-input-field"), {
        target: { value: "11.23" },
      });
      fireEvent.change(screen.getByTestId("swap-output-field"), {
        target: { value: "100.50" },
      });
      expect(screen.getByTestId("swap-input-field")).toHaveValue("11.23");
      expect(screen.getByTestId("swap-output-field")).toHaveValue("100.50");
    }
  );

  test(
    "US00003 -" +
      "Given: The Swap component is loaded" +
      "When: A user loads the Swap component" +
      "Then: The user can click 'Connect Wallet'.",
    async () => {
      render(<SwapTokens props={mockSwapProps} />);
      userEvent.click(screen.getByTestId("connect-wallet-button"));
      expect(screen.getByTestId("connect-wallet-button")).toBeInTheDocument();
    }
  );
});
