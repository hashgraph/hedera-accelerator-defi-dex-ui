import { useEffect, useState } from "react";
import { TransactionState } from "@dex/store";
import { createHashScanTransactionLink } from "@dex/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface UseNotificationProps {
  successMessage: string;
  transactionState: TransactionState | undefined;
}

export function useNotification(props: UseNotificationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { successMessage, transactionState } = props;
  const transactionId = transactionState?.successPayload?.transactionId?.toString();
  const defaultVisibility =
    Boolean(transactionState?.successPayload) &&
    !transactionState?.errorMessage &&
    !transactionState?.transactionWaitingToBeSigned;

  const [isNotificationVisible, setIsNotificationVisible] = useState(defaultVisibility);
  const [successNotificationMessage, setSuccessNotificationMessage] = useState("");
  const hashscanTransactionLink = createHashScanTransactionLink(
    transactionState?.successPayload?.transactionId.toString() ?? ""
  );

  const isSuccessNotificationVisible = defaultVisibility && isNotificationVisible;

  useEffect(() => {
    setSuccessNotificationMessage(successMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationVisible]);

  useEffect(() => {
    if (transactionId) {
      setIsNotificationVisible(true);
    } else {
      setIsNotificationVisible(false);
    }
  }, [transactionId]);

  function handleCloseNotificationButtonClicked() {
    setIsNotificationVisible(false);
    navigate(location.pathname, {});
  }

  return {
    hashscanTransactionLink,
    successNotificationMessage,
    isSuccessNotificationVisible,
    handleCloseNotificationButtonClicked,
    setIsNotificationVisible,
  };
}
