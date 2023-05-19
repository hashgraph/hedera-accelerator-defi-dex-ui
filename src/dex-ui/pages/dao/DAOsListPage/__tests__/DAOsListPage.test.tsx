import { render } from "@testing-library/react";
import { DAOsListPage } from "../DAOsListPage";
import { vi } from "vitest";

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => vi.fn(),
  };
});

vi.mock("@hooks", async () => {
  const actual: any = await vi.importActual("@hooks");
  return {
    ...actual,
    useDAOs: () => [],
    useDexContext: () => [],
  };
});

vi.mock("@dex-ui-components/base", () => {
  return {
    useNotification: () => [],
  };
});

vi.mock("@components", () => {
  return {
    PrimaryHeaderButton: () => <></>,
  };
});

test("renders App component", () => {
  render(<DAOsListPage />);
  expect(true).toBeTruthy();
});
