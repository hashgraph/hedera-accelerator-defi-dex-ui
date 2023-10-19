import { StepProps } from "@shared/ui-kit";
import {
  DAOUpgradeProposal,
  GOVUpgradeProposalDetails,
  Proposal,
  ProposalDataAddMember,
  ProposalDataChangeThreshold,
  ProposalDataDeleteMember,
  ProposalDataReplaceMember,
  ProposalDataTokenAssociation,
  ProposalType,
} from "@dao/hooks";
import { ProposalState } from "@dex/store";
import { HBARTokenSymbol, SENTINEL_OWNER } from "@dex/services";
import { DAOType } from "@dao/services";
import { isHbarToken } from "@dex/utils";
import { Routes } from "../routes";
import { solidityAddressToAccountIdString, solidityAddressToTokenIdString } from "@shared/utils";
import humanizeDuration from "humanize-duration";

export function getDAOLinksRecordArray(links: string[]): Record<"value", string>[] {
  const arrayOfRecords = links.map((linkString) => {
    return { value: linkString };
  });
  return arrayOfRecords;
}

interface GetPreviousMemberAddressParams {
  memberId: string;
  owners: string[];
}

export function getPreviousMemberAddress(params: GetPreviousMemberAddressParams): string {
  const { memberId, owners } = params;
  const index = owners.findIndex((owner) => owner === memberId);
  const prevMemberAddress = index === 0 ? SENTINEL_OWNER : owners[index - 1];
  return prevMemberAddress;
}

enum StepperProposalStatus {
  Created = "Created",
  Active = "Active",
  Queued = "Queued to Execute",
  Executed = "Executed",
  Defeated = "Defeated",
  Cancelled = "Cancelled",
}

export function getProposalSteps(
  state: ProposalState,
  isExecutionProcessing: boolean,
  hasExecutionFailed: boolean
): { steps: StepProps[]; activeStep: number } {
  let steps: StepProps[] = [];
  let activeStep = 0;
  if (
    state === ProposalState.Pending ||
    state === ProposalState.Active ||
    state === ProposalState.Succeeded ||
    state === ProposalState.Queued ||
    state === ProposalState.Executed
  ) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Queued,
        isLoading: isExecutionProcessing,
        isError: hasExecutionFailed,
      },
      {
        label: StepperProposalStatus.Executed,
      },
    ];
    if (state === ProposalState.Pending || state === ProposalState.Active) {
      activeStep = 1;
    } else if (state === ProposalState.Succeeded || state === ProposalState.Queued) {
      activeStep = 2;
    } else {
      activeStep = 4;
    }
  } else if (state === ProposalState.Canceled) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Cancelled,
        isError: true,
      },
    ];
    activeStep = 2;
  } else if (state === ProposalState.Defeated || state === ProposalState.Expired) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Defeated,
        isError: true,
      },
    ];
    activeStep = 2;
  }
  return { steps, activeStep };
}

export function getProposalData(proposal: Proposal): string {
  switch (proposal.type) {
    case ProposalType.AddNewMember: {
      const { owner, _threshold } = proposal.data as ProposalDataAddMember;
      const ownerAddress = solidityAddressToAccountIdString(owner);
      return `Proposed to add new member ${ownerAddress} and change threshold to ${_threshold}`;
    }
    case ProposalType.RemoveMember: {
      const { owner, _threshold } = proposal.data as ProposalDataDeleteMember;
      const ownerAddress = solidityAddressToAccountIdString(owner);
      return `Proposed to remove member ${ownerAddress} and change threshold to ${_threshold}`;
    }
    case ProposalType.ReplaceMember: {
      const { oldOwner, newOwner } = proposal.data as ProposalDataReplaceMember;
      const oldOwnerAddress = solidityAddressToAccountIdString(oldOwner);
      const newOwnerAddress = solidityAddressToAccountIdString(newOwner);
      return `Proposed to replace member ${oldOwnerAddress} with ${newOwnerAddress}`;
    }
    case ProposalType.ChangeThreshold: {
      const { _threshold } = proposal.data as ProposalDataChangeThreshold;
      return `Proposed to change required threshold to ${_threshold}`;
    }
    case ProposalType.TokenAssociate: {
      const { tokenAddress } = proposal.data as ProposalDataTokenAssociation;
      const tokenToAssociate = solidityAddressToTokenIdString(tokenAddress);
      return isHbarToken(tokenToAssociate)
        ? `Proposed to Associate Token: ${HBARTokenSymbol}`
        : `Proposed to Associate Token: ${tokenToAssociate}`;
    }
    case ProposalType.UpgradeContract: {
      const { proxyLogic, currentLogic } = proposal.data as DAOUpgradeProposal | GOVUpgradeProposalDetails;
      return `Proposed to upgrade DAO from ${currentLogic} to ${proxyLogic}`;
    }
    default:
      return "";
  }
}

export function getDAOType(path: string) {
  switch (path) {
    case Routes.Multisig:
      return DAOType.MultiSig;
    case Routes.GovernanceToken:
      return DAOType.GovernanceToken;
    case Routes.NFT:
      return DAOType.NFT;
    default:
      return "";
  }
}

export const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
});
