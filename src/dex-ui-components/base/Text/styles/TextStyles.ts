import { Color } from "../../../themes/constants";

const fontType = {
  // fontFamily: "Inter",
  // fontStyle: "normal",
};

const fontWeight = {
  Regular: "400",
  Bold: "700",
};

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const TextStyles = {
  /** Content headings, marketing page headings, large display headings */
  h1: {
    ...fontType,
    fontWeight: fontWeight.Bold,
    fontSize: "48px",
    lineHeight: "58px",
    letterSpacing: "0.005em",
    color: Color.Text_Primary,
  },
  /** Content headings, marketing page headings, large display headings */
  h2: {
    ...fontType,
    fontWeight: fontWeight.Bold,
    fontSize: "29px",
    lineHeight: "35px",
    letterSpacing: "0.005em",
    color: Color.Text_Primary,
  },
  h2_empty_or_error: {
    ...fontType,
    fontWeight: fontWeight.Bold,
    fontSize: "29px",
    lineHeight: "35px",
    letterSpacing: "0.005em",
    color: Color.Grey_01,
  },
  /** Content headings, marketing page headings, large display headings */
  h3: {
    ...fontType,
    fontWeight: fontWeight.Bold,
    fontSize: "18px",
    lineHeight: "22px",
    letterSpacing: "0.005em",
    color: Color.Text_Primary,
  },
  /** Content headings, marketing page headings, large display headings */
  h4: {
    ...fontType,
    fontWeight: fontWeight.Bold,
    fontSize: "12px",
    lineHeight: "15px",
    color: Color.Text_Primary,
  },
  /** Body copy for touch devices and more spacious Marketing pages */
  b1: {
    ...fontType,
    fontWeight: fontWeight.Regular,
    fontSize: "18px",
    lineHeight: "22px",
    color: Color.Text_Primary,
  },
  /** Standard Body style for web and general product pages */
  b2: {
    ...fontType,
    fontWeight: fontWeight.Regular,
    fontSize: "16px",
    lineHeight: "19px",
    color: Color.Text_Primary,
  },
  /** Standard Body style for Desktop and more condensed product designs. */
  b3: {
    ...fontType,
    fontWeight: fontWeight.Regular,
    fontSize: "12px",
    lineHeight: "15px",
    color: Color.Text_Primary,
  },
  /** Links */
  link: {
    ...fontType,
    fontWeight: fontWeight.Bold,
    fontSize: "10px",
    lineHeight: "12px",
    color: Color.Teal_01,
    ":hover": {
      textDecoration: "underline",
      textDecorationColor: Color.Teal_01,
      webkitTextDecorationColor: Color.Teal_01,
    },
  },
};
