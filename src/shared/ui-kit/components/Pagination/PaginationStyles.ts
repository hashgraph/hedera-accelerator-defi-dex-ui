import { TextStyles, Color } from "../../themes";

export const PaginationStyles = {
  ".pagination": {
    ...TextStyles?.["p medium medium"],
    color: Color.Neutral._500,
    marginBottom: "2rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    listStyleType: "none",
    userSelect: "none",
  },
  ".pagination__page-link": {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "2rem",
    height: "2rem",
    padding: "0 0.5rem",
    borderRadius: "6px",
    transition: "all 0.15s ease-in-out",
    "&:hover": {
      color: Color.Primary._600,
      backgroundColor: Color.Primary._50,
    },
  },
  ".pagination__nav-link": {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: "6px",
    transition: "all 0.15s ease-in-out",
    "&:hover": {
      color: Color.Primary._600,
      backgroundColor: Color.Primary._50,
    },
  },
  ".pagination__nav--disabled": {
    opacity: 0.3,
    pointerEvents: "none",
  },
  ".pagination__break": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "2rem",
    height: "2rem",
    color: Color.Neutral._400,
  },
  ".pagination__page-item--active": {
    ".pagination__page-link": {
      backgroundColor: Color.Primary._500,
      color: Color.White,
    },
  },
  ".pagination__page-link--active": {
    color: Color.White,
    fontWeight: "600",
  },
};
