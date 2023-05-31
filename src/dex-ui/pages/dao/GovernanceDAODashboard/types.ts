import { GovernanceDAODetails } from "@dex-ui/services";
import { TokenBalance } from "@hooks";

export interface Member {
  name: string;
  logo: string;
  accountId: string;
}

export type GovernanceDAODetailsContext = {
  dao: GovernanceDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
};
