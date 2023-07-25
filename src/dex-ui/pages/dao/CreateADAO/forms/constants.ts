export const DAOToolTips = Object.freeze({
  threshold: "This is the minimum number of signers required to validate a transaction.",
  quorum: `This is the percentage of voting power required in 
    order for a proposal vote to be valid. If quorum is not 
    met, the proposal is cancelled.`,
  duration: `For Governance token DAOs, the way that voting 
    power is distributed. For example: One vote per locked token,
    Quadratic voting, etc.`,
  lockingPeriod: `The time period that token deposits from proposal submitters are locked.`,
});

export const DefaultTokenDAOGovernanceData = {
  tokenType: "",
  newToken: {
    name: "",
    symbol: "",
    decimals: 8,
    logo: "",
    initialSupply: 0,
    id: "",
    tokenWalletAddress: "",
    treasuryWalletAccountId: "",
  },
  existingToken: {
    name: "",
    symbol: "",
    decimals: 0,
    logo: "",
    initialSupply: 0,
    supplyKey: "",
    id: "",
    treasuryWalletAccountId: "",
    mirrorNodeTokenId: "",
  },
};

export const DefaultTokenDAOVotingData = {
  minProposalDeposit: 0,
  quorum: 0,
  duration: 0,
  lockingPeriod: 0,
  strategy: "",
};

export const DefaultCreateATokenDAOFormData = {
  governance: DefaultTokenDAOGovernanceData,
  voting: DefaultTokenDAOVotingData,
};
