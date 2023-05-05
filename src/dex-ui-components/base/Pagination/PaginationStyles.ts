import { TextStyles, Color } from "../../themes";

export const PaginationStyles = {
  ".pagination": {
    ...TextStyles?.h3,
    color: Color.Grey_02,
    marginBottom: "2rem",
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",
    listStyleType: "none",
    userSelect: "none",
  },
  "pagination__page-link": {
    cursor: "pointer",
  },
  ".pagination__page-item--active": {
    borderBottom: `${Color.Black_01} solid 4px`,
  },
  ".pagination__page-link--active": {
    color: Color.Black_01,
  },
};
