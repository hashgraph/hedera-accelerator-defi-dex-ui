import { Color } from "./colors";

const fontType = {
  // fontFamily: "Inter",
  // fontStyle: "normal",
};

const fontWeight = {
  Regular: "400",
  Medium: "500",
  Semibold: "600",
  Bold: "700",
};

const baseStyles = {
  h1: {
    ...fontType,
    fontSize: "48px",
    lineHeight: "57.6px",
    letterSpacing: "-2%",
    color: Color.Neutral._900,
  },
  h2: {
    ...fontType,
    fontSize: "36px",
    lineHeight: "43.2px",
    letterSpacing: "-2%",
    color: Color.Neutral._900,
  },
  h3: {
    ...fontType,
    fontSize: "28px",
    lineHeight: "33.6px",
    letterSpacing: "-2%",
    color: Color.Neutral._900,
  },
  h4: {
    ...fontType,
    fontSize: "20px",
    lineHeight: "24px",
    letterSpacing: "-2%",
    color: Color.Neutral._900,
  },
  h5: {
    ...fontType,
    fontSize: "16px",
    lineHeight: "24px",
    letterSpacing: "-2%",
    color: Color.Neutral._900,
  },
  h6: {
    ...fontType,
    fontSize: "14px",
    lineHeight: "24px",
    letterSpacing: "-2%",
    color: Color.Neutral._900,
  },
  p_large: {
    ...fontType,
    fontSize: "18px",
    lineHeight: "25.2px",
    color: Color.Neutral._900,
  },
  p_medium: {
    ...fontType,
    fontSize: "16px",
    lineHeight: "22.4px",
    color: Color.Neutral._900,
  },
  p_small: {
    ...fontType,
    fontSize: "14px",
    lineHeight: "19.6px",
    color: Color.Neutral._900,
  },
  p_xsmall: {
    ...fontType,
    fontSize: "12px",
    lineHeight: "16.8px",
    color: Color.Neutral._900,
  },
  overline: {
    ...fontType,
    fontWeight: fontWeight.Medium,
    color: Color.Neutral._900,
    textTransform: "uppercase",
  },
  link: {
    ...fontType,
    color: Color.Primary._500,
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
      textDecorationColor: Color.Primary._500,
      webkitTextDecorationColor: Color.Primary._500,
    },
  },
};

/**
 * Base Chakra UI styles and variants for the Hedera DEX Button and IconButton components.
 */
export const TextStyles = {
  /**
   * V1 Textstyles [Deprecated] - Remove once all text styles are migrated to the V2 design system text styles.
   */
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
    fontSize: "12px",
    lineHeight: "15px",
    color: Color.Teal_01,
    ":hover": {
      textDecoration: "underline",
      textDecorationColor: Color.Teal_01,
      webkitTextDecorationColor: Color.Teal_01,
    },
  },
  /**
   * V2 Textstyles
   */
  /**
   * Heading
   * Size: H1
   */
  "h1 medium": {
    ...baseStyles.h1,
    fontWeight: fontWeight.Medium,
  },
  "h1 semibold": {
    ...baseStyles.h1,
    fontWeight: fontWeight.Semibold,
  },
  "h1 bold": {
    ...baseStyles.h1,
    fontWeight: fontWeight.Bold,
  },
  /**
   * Heading
   * Size: H2
   */
  "h2 medium": {
    ...baseStyles.h2,
    fontWeight: fontWeight.Medium,
  },
  "h2 semibold": {
    ...baseStyles.h2,
    fontWeight: fontWeight.Semibold,
  },
  "h2 bold": {
    ...baseStyles.h2,
    fontWeight: fontWeight.Bold,
  },
  /**
   * Heading
   * Size: H3
   */
  "h3 medium": {
    ...baseStyles.h3,
    fontWeight: fontWeight.Medium,
  },
  "h3 semibold": {
    ...baseStyles.h3,
    fontWeight: fontWeight.Semibold,
  },
  "h3 bold": {
    ...baseStyles.h3,
    fontWeight: fontWeight.Bold,
  },
  /**
   * Heading
   * Size: H4
   */
  "h4 medium": {
    ...baseStyles.h4,
    fontWeight: fontWeight.Medium,
  },
  "h4 semibold": {
    ...baseStyles.h4,
    fontWeight: fontWeight.Semibold,
  },
  "h4 bold": {
    ...baseStyles.h4,
    fontWeight: fontWeight.Bold,
  },
  /**
   * Heading
   * Size: H4
   */
  "h5 medium": {
    ...baseStyles.h5,
    fontWeight: fontWeight.Medium,
  },
  "h5 semibold": {
    ...baseStyles.h5,
    fontWeight: fontWeight.Semibold,
  },
  "h5 bold": {
    ...baseStyles.h5,
    fontWeight: fontWeight.Bold,
  },
  /**
   * Heading
   * Size: H4
   */
  "h6 medium": {
    ...baseStyles.h6,
    fontWeight: fontWeight.Medium,
  },
  "h6 semibold": {
    ...baseStyles.h6,
    fontWeight: fontWeight.Semibold,
  },
  "h6 bold": {
    ...baseStyles.h6,
    fontWeight: fontWeight.Bold,
  },
  /**
   * Paragraph
   * Size: Large
   */
  "p large regular": {
    ...baseStyles.p_large,
    fontWeight: fontWeight.Regular,
  },
  "p large medium": {
    ...baseStyles.p_large,
    fontWeight: fontWeight.Medium,
  },
  "p large semibold": {
    ...baseStyles.p_large,
    fontWeight: fontWeight.Semibold,
  },
  "p large underline": {
    ...baseStyles.p_large,
    fontWeight: fontWeight.Regular,
    textDecorationLine: "underline",
  },
  "p large italic": {
    ...baseStyles.p_large,
    fontStyle: "italic",
    fontWeight: fontWeight.Regular,
  },
  /**
   * Paragraph
   * Size: Medium
   */
  "p medium regular": {
    ...baseStyles.p_medium,
    fontWeight: fontWeight.Regular,
  },
  "p medium medium": {
    ...baseStyles.p_medium,
    fontWeight: fontWeight.Medium,
  },
  "p medium semibold": {
    ...baseStyles.p_medium,
    fontWeight: fontWeight.Semibold,
  },
  "p medium underline": {
    ...baseStyles.p_medium,
    fontWeight: fontWeight.Regular,
    textDecorationLine: "underline",
  },
  "p medium italic": {
    ...baseStyles.p_medium,
    fontStyle: "italic",
    fontWeight: fontWeight.Regular,
  },
  "p medium semibold link": {
    ...baseStyles.p_medium,
    fontWeight: fontWeight.Semibold,
    ...baseStyles.link,
  },
  /**
   * Paragraph
   * Size: Small
   */
  "p small regular": {
    ...baseStyles.p_small,
    fontWeight: fontWeight.Regular,
  },
  "p small medium": {
    ...baseStyles.p_small,
    fontWeight: fontWeight.Medium,
  },
  "p small semibold": {
    ...baseStyles.p_small,
    fontWeight: fontWeight.Semibold,
  },
  "p small underline": {
    ...baseStyles.p_small,
    fontWeight: fontWeight.Regular,
    textDecorationLine: "underline",
  },
  "p small italic": {
    ...baseStyles.p_small,
    fontStyle: "italic",
    fontWeight: fontWeight.Regular,
  },
  "p small parentheses": {
    ...baseStyles.p_small,
    fontWeight: fontWeight.Regular,
    _before: { content: `"("` },
    _after: { content: `")"` },
  },
  "p small regular link": {
    ...baseStyles.p_small,
    ...baseStyles.link,
    fontWeight: fontWeight.Regular,
  },
  "p small semibold link": {
    ...baseStyles.p_small,
    ...baseStyles.link,
    fontWeight: fontWeight.Semibold,
  },
  /**
   * Paragraph
   * Size: XSmall
   */
  "p xsmall regular": {
    ...baseStyles.p_xsmall,
    fontWeight: fontWeight.Regular,
  },
  "p xsmall medium": {
    ...baseStyles.p_xsmall,
    fontWeight: fontWeight.Medium,
  },
  "p xsmall semibold": {
    ...baseStyles.p_xsmall,
    fontWeight: fontWeight.Semibold,
  },
  "p xsmall underline": {
    ...baseStyles.p_xsmall,
    fontWeight: fontWeight.Regular,
    textDecorationLine: "underline",
  },
  "p xsmall italic": {
    ...baseStyles.p_xsmall,
    fontStyle: "italic",
    fontWeight: fontWeight.Regular,
  },
  "p xsmall regular link": {
    ...baseStyles.p_xsmall,
    ...baseStyles.link,
    fontWeight: fontWeight.Regular,
  },
  /**
   * Overline
   */
  "overline large": {
    ...baseStyles.overline,
    fontSize: "14px",
    lineHeight: "19.6px",
  },
  "overline small": {
    ...baseStyles.overline,
    fontSize: "12px",
    lineHeight: "16.8px",
  },
};
