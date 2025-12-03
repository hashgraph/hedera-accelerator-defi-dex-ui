import { Color, DarkTheme } from "./colors";

const HeaderHeight = 65;
const FooterHeight = 33;
export const BodyHeight = HeaderHeight + FooterHeight;

const base = {
  padding: "1rem",
  bg: DarkTheme.bgCard,
  border: `1px solid ${DarkTheme.border}`,
  borderRadius: "16px",
  backdropFilter: "blur(20px)",
};

const ToastLayerStyles = {
  toast__body: {
    direction: "row",
    alignItems: "center",
    padding: "0.75rem",
    gap: 2,
    bg: DarkTheme.bgSecondary,
    border: `1px solid ${DarkTheme.border}`,
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
  },
};

const WizardLayerStyles = {
  wizard__container: {
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "624px",
    width: "100%",
    margin: "auto",
    gap: "6",
    paddingTop: "1.5rem",
    px: { base: "1rem", md: "0" },
  },
  wizard__header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  wizard__form: {
    flexDirection: "column",
    backgroundColor: DarkTheme.bgCard,
    border: `1px solid ${DarkTheme.border}`,
    padding: { base: "1rem", md: "1.5rem" },
    borderRadius: "16px",
    width: "100%",
    gap: "0.75rem",
    backdropFilter: "blur(20px)",
  },
  "dao-wizard__form": {
    flexDirection: "column",
    backgroundColor: DarkTheme.bgCard,
    width: "100%",
    gap: "0.75rem",
  },
  wizard__footer: {
    width: "100%",
  },
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
    templateColumns: { base: "1fr", sm: "repeat(2, 1fr)" },
    borderRadius: "20px",
    maxWidth: { base: "100%", sm: "550px" },
    minWidth: { base: "auto", sm: "320px", md: "410px" },
    padding: { base: "1rem", md: "1.25rem" },
    mx: { base: "0.5rem", sm: "auto" },
  },
  "dao-dashboard__card": {
    ...base,
    flexDirection: "column",
    padding: { base: "1rem", md: "1.5rem" },
    width: "100%",
    height: "100%",
    gap: { base: "4", md: "8" },
  },
  ...WizardLayerStyles,
  ...ToastLayerStyles,
  "proposal-details__page": {
    gap: "4",
    width: "100%",
    height: "100%",
    padding: { base: "1rem", sm: "1.5rem 1.5rem", md: "1.5rem 2rem", lg: "1.5rem 3rem", xl: "1.5rem 5rem" },
  },
  "dao-dashboard__content-body": {
    minWidth: "100%",
    padding: { base: "1rem", sm: "1rem 1.5rem", md: "1rem 2rem", lg: "1rem 3rem", xl: "1rem 5rem 16px" },
  },
  "dao-dashboard__content-header": {
    width: "100%",
    minHeight: { base: "auto", md: "64px" },
    alignItems: "center",
    padding: { base: "1rem", sm: "1rem 1.5rem", md: "1rem 2rem", lg: "1rem 3rem", xl: "1rem 5rem 16px" },
    bg: DarkTheme.bgSecondary,
    borderBottom: `1px solid ${DarkTheme.border}`,
    flexWrap: "wrap",
    gap: "2",
  },
  "dao-dashboard__content-header--with-tabs": {
    width: "100%",
    minHeight: { base: "auto", md: "64px" },
    alignItems: { base: "start", md: "end" },
    padding: { base: "0 1rem 2px", sm: "0 1.5rem 2px", md: "0 2rem 2px", lg: "0 3rem 2px", xl: "0 5rem 2px" },
    bg: DarkTheme.bgSecondary,
    borderBottom: `1px solid ${DarkTheme.border}`,
    flexWrap: "wrap",
  },
  navbar: {
    zIndex: 200,
    direction: "row",
    position: "fixed",
    top: 0,
    padding: { base: "0.75rem 1rem", sm: "1rem 1.5rem", md: "1rem 2rem" },
    width: "100%",
    height: `${HeaderHeight}px`,
    alignItems: "center",
    justifyContent: "space-between",
    bg: "rgba(10, 10, 15, 0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: `1px solid ${DarkTheme.border}`,
    gap: { base: "2", md: "4" },
  },
  footer: {
    direction: "row",
    padding: { base: "1rem", md: "1rem 2rem" },
    width: "100%",
    minHeight: `${FooterHeight}px`,
    height: "auto",
    alignItems: "center",
    justifyContent: "space-between",
    bg: DarkTheme.bg,
    borderTop: `1px solid ${DarkTheme.border}`,
    gap: { base: "2", sm: "4" },
    flexWrap: "wrap",
  },
  body: {
    color: DarkTheme.text,
    width: "100%",
    maxWidth: "100%",
    minHeight: `calc(100vh - ${BodyHeight}px)`,
    height: "100%",
    bg: DarkTheme.bg,
    padding: "0",
    marginTop: "4rem",
  },
};
