import { ToastErrorIcon, ToastSuccessIcon, ToastInfoIcon } from "../Icons";

export enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
}

export const ToastIcon = {
  [ToastType.Success]: <ToastSuccessIcon boxSize="8" />,
  [ToastType.Error]: <ToastErrorIcon boxSize="8" />,
  [ToastType.Info]: <ToastInfoIcon boxSize="8" />,
};
