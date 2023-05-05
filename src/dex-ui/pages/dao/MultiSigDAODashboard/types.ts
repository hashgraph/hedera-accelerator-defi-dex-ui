import { TokenBalance } from "@hooks";
import { MultiSigDAODetails } from "@services";

export interface Member {
  name: string;
  logo: string;
  accountId: string;
}

export type MultiSigDAODetailsContext = {
  dao: MultiSigDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
};
