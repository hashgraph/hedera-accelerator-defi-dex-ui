import { render } from "@testing-library/react";
import { Breadcrumb } from "../Breadcrumb";

test("renders App component", () => {
  render(<Breadcrumb to={"test-route"} as={"div"} label="Back to Proposals" />);
  expect(true).toBeTruthy();
});
