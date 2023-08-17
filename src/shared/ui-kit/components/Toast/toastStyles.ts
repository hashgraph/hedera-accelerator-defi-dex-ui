import { Color } from "../../themes";

export const ToastStyles = `
  --toastify-color-light: ${Color.White};
  --toastify-color-info: ${Color.Blue._500};
  --toastify-color-success: ${Color.Success._700};
  --toastify-color-error: ${Color.Destructive._700};

  --toastify-icon-color-info: var(--toastify-color-info);
  --toastify-icon-color-success: var(--toastify-color-success);
  --toastify-icon-color-error: var(--toastify-color-error);

  --toastify-text-color-light: ${Color.Neutral._900};

  --toastify-text-color-info: ${Color.White};
  --toastify-text-color-success: ${Color.White};
  --toastify-text-color-error: ${Color.White};

  --toastify-color-progress-info: var(--toastify-color-info);
  --toastify-color-progress-success: var(--toastify-color-success);
  --toastify-color-progress-error: var(--toastify-color-error);

  &&&.Toastify__toast-container {
    padding: 0;
  }
  .Toastify__toast {
    padding: 0;
  }
  .Toastify__toast-body {
    padding: 0;
  }
`;
