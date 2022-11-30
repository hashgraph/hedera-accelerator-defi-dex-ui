import { Color } from "../../../themes/constants";

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const TextStyles = {
  /** Content headings, marketing page headings, large display headings */
  h1: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "700",
    fontSize: "48px",
    lineHeight: "58px",
    letterSpacing: "0.005em",
    color: Color.Text_Primary,
  },
  /** Content headings, marketing page headings, large display headings */
  h2: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "700",
    fontSize: "29px",
    lineHeight: "35px",
    letterSpacing: "0.005em",
    color: Color.Text_Primary,
  },
  /** Content headings, marketing page headings, large display headings */
  h3: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "700",
    fontSize: "18px",
    lineHeight: "22px",
    letterSpacing: "0.005em",
    color: Color.Text_Primary,
  },
  /** Content headings, marketing page headings, large display headings */
  h4: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "700",
    fontSize: "12px",
    lineHeight: "15px",
    color: Color.Text_Primary,
  },
  /** Body copy for touch devices and more spacious Marketing pages */
  b1: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "400",
    fontSize: "18px",
    lineHeight: "22px",
    color: Color.Text_Primary,
  },
  /** Standard Body style for web and general product pages */
  b2: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "400",
    fontSize: "16px",
    lineHeight: "19px",
    color: Color.Text_Primary,
  },
  /** Standard Body style for Desktop and more condensed product designs. */
  b3: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "400",
    fontSize: "12px",
    lineHeight: "15px",
    color: Color.Text_Primary,
  },
  /** Links */
  link: {
    // fontFamily: "Inter",
    // fontStyle: "normal",
    fontWeight: "700",
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
