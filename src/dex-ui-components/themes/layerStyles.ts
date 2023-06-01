import { Color } from "./color";

const base = {
  padding: "1rem",
  bg: Color.White,
  border: `1px solid ${Color.Neutral._200}`,
  borderRadius: "4px",
};

export const LayerStyles = {
  base: {
    ...base,
  },
  "content-box": {
    ...base,
  },
  "defi-form": {
    ...base,
    templateColumns: "repeat(2, 1fr)",
    borderRadius: "15px",
    maxWidth: "550px",
    minWidth: "410px",
  },
  wizard__container: {
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "624px",
    margin: "auto",
    gap: "6",
    paddingTop: "2rem",
  },
  wizard__header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  wizard__form: {
    flexDirection: "column",
    backgroundColor: Color.White,
    border: `1px solid ${Color.Neutral._200}`,
    padding: "1.5rem",
    borderRadius: "4px",
    width: "100%",
    gap: "0.75rem",
  },
  "dao-wizard__form": {
    flexDirection: "column",
    backgroundColor: Color.White,
    width: "100%",
    gap: "0.75rem",
  },
  wizard__footer: {
    width: "100%",
  },
  "dao-dashboard__card": {
    ...base,
    flexDirection: "column",
    padding: "1.5rem",
    width: "100%",
    height: "100%",
    gap: "8",
  },
};
