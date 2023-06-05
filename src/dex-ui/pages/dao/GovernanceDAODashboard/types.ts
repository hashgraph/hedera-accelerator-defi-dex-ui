import { GovernanceDAODetails, Member } from "@services";
import { TokenBalance } from "@hooks";

export type GovernanceDAODetailsContext = {
  dao: GovernanceDAODetails;
  tokenBalances: TokenBalance[];
  ownerCount: number;
  members: Member[];
  memberCount: number;
  tokenCount: number;
  totalAssetValue: number;
};
