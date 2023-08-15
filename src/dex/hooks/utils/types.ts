import { TransactionResponse } from "@hashgraph/sdk";

export type HandleOnSuccess = (transactionResponse: TransactionResponse) => void;
