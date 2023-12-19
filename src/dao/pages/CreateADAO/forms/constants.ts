export const DAOToolTips = Object.freeze({
  threshold: "This is the minimum number of signers required to validate a transaction.",
  quorum: `This is the percentage of voting power required in 
    order for a proposal vote to be valid. If quorum is not 
    met, the proposal is cancelled.`,
  duration: `The time period of a proposal.`,
  lockingPeriod: `The time period that proposal is delayed before you can start voting.`,
  minimumDeposit: "This is the amount that must be deposited in order to submit a proposal.",
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
    tokenType: "",
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
