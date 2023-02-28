import { useEffect, useState } from "react";
import { TransactionState } from "../../../dex-ui/store/swapSlice";
import { createHashScanTransactionLink } from "../../../dex-ui/utils";

interface UseNotificationProps {
  successMessage: string;
  transactionState: TransactionState | undefined;
}

export function useNotification(props: UseNotificationProps) {
  const defaultVisibility =
    Boolean(props.transactionState?.successPayload) &&
    !props.transactionState?.errorMessage &&
    !props.transactionState?.transactionWaitingToBeSigned;

  const [isNotificationVisible, setIsNotificationVisible] = useState(defaultVisibility);
  const [successNotificationMessage, setSuccessNotificationMessage] = useState("");
  const hashscanTransactionLink = createHashScanTransactionLink(
    props.transactionState?.successPayload?.transactionId.toString() ?? ""
  );

  const isSuccessNotificationVisible = defaultVisibility && isNotificationVisible;

  useEffect(() => {
    setSuccessNotificationMessage(props.successMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationVisible]);

  function handleCloseNotificationButtonClicked() {
    setIsNotificationVisible(false);
  }

  return {
    hashscanTransactionLink,
    successNotificationMessage,
    isSuccessNotificationVisible,
    handleCloseNotificationButtonClicked,
    setIsNotificationVisible,
  };
}
