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
};
