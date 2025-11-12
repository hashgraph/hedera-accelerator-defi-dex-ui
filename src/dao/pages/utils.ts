import { StepProps } from "@shared/ui-kit";
import { Proposal } from "@dao/hooks";
import { ProposalState } from "@dex/store";
import { DAO, DAOType } from "@dao/services";
import { solidityAddressToAccountIdString } from "@shared/utils";
import humanizeDuration from "humanize-duration";
import BigNumber from "bignumber.js";

export function getDAOLinksRecordArray(links: string[]): Record<"value", string>[] {
  const arrayOfRecords = links.map((linkString) => {
    return { value: linkString };
  });
  return arrayOfRecords;
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

export function filterDAOs(
  daoList: DAO[],
  options: { searchText: string; type: string | undefined; isMyDAOsTabSelected: boolean; currentUser: string }
) {
  const { searchText, type, isMyDAOsTabSelected, currentUser } = options;
  let filteredDAOs = daoList;
  if (isMyDAOsTabSelected) {
    filteredDAOs = filteredDAOs?.filter((dao) => {
      if (dao.type === DAOType.MultiSig) {
        return dao.ownerIds.includes(currentUser);
      } else {
        const lockedTokenAmount = dao.lockedTokenDetails?.find(
          (item) => solidityAddressToAccountIdString(item.user) === currentUser
        )?.idOrAmount;
        const hasLockedTokens = lockedTokenAmount && BigNumber(lockedTokenAmount).toNumber() > 0;
        return dao.adminId === currentUser || hasLockedTokens;
      }
    });
  } else {
    filteredDAOs = filteredDAOs.filter((dao) => !dao.isPrivate);
  }
  if (type) {
    filteredDAOs = filteredDAOs?.filter((dao) => {
      return dao.type === options.type;
    });
  }
  if (searchText) {
    filteredDAOs = filteredDAOs?.filter((dao) => {
      return (
        dao.name.toLowerCase().includes(searchText.toLowerCase()) ||
        dao.description.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }
  return filteredDAOs;
}
