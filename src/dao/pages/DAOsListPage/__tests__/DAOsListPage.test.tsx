import { render } from "@testing-library/react";
import { DAOsListPage } from "../DAOsListPage";
import { test, expect, vi } from "vitest";

vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => vi.fn(),
  };
});

vi.mock("@dex/hooks", async () => {
  const actual: any = await vi.importActual("@dex/hooks");
  return {
    ...actual,
    useDAOs: () => [],
    useDexContext: () => [],
  };
});

vi.mock("@shared/ui-kit/base", () => {
  return {
    useNotification: () => [],
  };
});

vi.mock("@dex/components", () => {
  return {
    PrimaryHeaderButton: () => <></>,
  };
});

test("renders App component", () => {
  render(<DAOsListPage />);
  expect(true).toBeTruthy();
});
