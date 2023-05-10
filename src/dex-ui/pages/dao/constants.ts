import { TagVariant } from "@dex-ui-components";
import { TransactionStatus } from "@hooks";

export const TransactionStatusAsTagVariant: Readonly<{ [key in TransactionStatus]: TagVariant }> = {
  [TransactionStatus.Pending]: TagVariant.Active,
  [TransactionStatus.Queued]: TagVariant.Queued,
  [TransactionStatus.Success]: TagVariant.Succeeded,
  [TransactionStatus.Failed]: TagVariant.Failed,
};
