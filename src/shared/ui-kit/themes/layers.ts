import { Color } from "./colors";

const HeaderHeight = 65;
const FooterHeight = 33;
export const BodyHeight = HeaderHeight + FooterHeight;

const base = {
  padding: "1rem",
  bg: Color.White,
  border: `1px solid ${Color.Neutral._200}`,
  borderRadius: "4px",
};

const ToastLayerStyles = {
  toast__body: {
    direction: "row",
    alignItems: "center",
    padding: "0.75rem",
    gap: 2,
    bg: Color.White_01,
    border: `1px solid ${Color.Neutral._200}`,
    borderRadius: "5px",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)",
  },
};

const WizardLayerStyles = {
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
  "dao-dashboard__card": {
    ...base,
    flexDirection: "column",
    padding: "1.5rem",
    width: "100%",
    height: "100%",
    gap: "8",
  },
  ...WizardLayerStyles,
  ...ToastLayerStyles,
  "proposal-details__page": {
    gap: "4",
    width: "100%",
    height: "100%",
    padding: "1.5rem 5rem",
  },
  "dao-dashboard__content-body": {
    minWidth: "100%",
    padding: "1rem 80px 16px",
  },
  "dao-dashboard__content-header": {
    width: "100%",
    height: "64px",
    alignItems: "center",
    padding: "1rem 80px 16px",
    bg: Color.White,
    borderBottom: `1px solid ${Color.Neutral._200}`,
  },
  "dao-dashboard__content-header--with-tabs": {
    width: "100%",
    height: "64px",
    alignItems: "end",
    padding: "0 80px 2px",
    bg: Color.White,
    borderBottom: `1px solid ${Color.Neutral._200}`,
  },
  navbar: {
    zIndex: 200,
    direction: "row",
    position: "fixed",
    top: 0,
    padding: "2rem 1rem",
    width: "100%",
    height: `${HeaderHeight}px`,
    alignItems: "center",
    justifyContent: "space-between",
    bg: Color.White,
    borderBottom: `1px solid ${Color.Neutral._200}`,
  },
  footer: {
    direction: "row",
    padding: "1rem",
    width: "100%",
    height: `${FooterHeight}px`,
    alignItems: "center",
    justifyContent: "space-between",
    bg: Color.White,
    borderTop: `1px solid ${Color.Neutral._100}`,
  },
  body: {
    color: Color.Black,
    width: "100%",
    maxWidth: "100%",
    minHeight: `calc(100vh - ${BodyHeight}px)`,
    height: "100%",
    bg: Color.White,
    padding: "0",
    marginTop: "4rem",
  },
};
