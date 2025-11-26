/**
 * Utility functions for storing and retrieving team member designations
 * Team members are stored in localStorage since they're not part of the smart contract
 *
 * Strategy: Store by both address and by name mapping
 * - By address (after DAO is created): `dao_team_members_{daoAddress}`
 * - By name (during creation, before address is known): `dao_team_members_by_name`
 */

const TEAM_MEMBERS_PREFIX = "dao_team_members_";
const TEAM_MEMBERS_BY_NAME_KEY = "dao_team_members_by_name";

interface TeamMembersByName {
  [walletAddress: string]: {
    [daoName: string]: string[];
  };
}

export function storeTeamMembersByName(walletAddress: string, daoName: string, teamMembers: string[]): void {
  try {
    const stored = localStorage.getItem(TEAM_MEMBERS_BY_NAME_KEY);
    const mapping: TeamMembersByName = stored ? JSON.parse(stored) : {};

    if (!mapping[walletAddress]) {
      mapping[walletAddress] = {};
    }

    mapping[walletAddress][daoName] = teamMembers;
    localStorage.setItem(TEAM_MEMBERS_BY_NAME_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.error("Failed to store team members by name:", error);
  }
}

export function getTeamMembersByName(walletAddress: string, daoName: string): string[] {
  try {
    const stored = localStorage.getItem(TEAM_MEMBERS_BY_NAME_KEY);
    if (!stored) return [];

    const mapping: TeamMembersByName = JSON.parse(stored);
    return mapping[walletAddress]?.[daoName] ?? [];
  } catch (error) {
    console.error("Failed to retrieve team members by name:", error);
    return [];
  }
}

export function storeTeamMembers(daoAddress: string, teamMembers: string[]): void {
  try {
    const key = `${TEAM_MEMBERS_PREFIX}${daoAddress}`;
    localStorage.setItem(key, JSON.stringify(teamMembers));
  } catch (error) {
    console.error("Failed to store team members:", error);
  }
}

export function getTeamMembers(daoAddress: string, daoName?: string): string[] {
  try {
    // First try address-based storage
    const key = `${TEAM_MEMBERS_PREFIX}${daoAddress}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }

    // If not found and DAO name is provided, check name-based storage for all wallets
    if (daoName) {
      const byNameStored = localStorage.getItem(TEAM_MEMBERS_BY_NAME_KEY);
      if (byNameStored) {
        const mapping: TeamMembersByName = JSON.parse(byNameStored);
        // Search across all wallets for this DAO name
        for (const walletAddress in mapping) {
          if (mapping[walletAddress][daoName]) {
            const teamMembers = mapping[walletAddress][daoName];
            // Migrate to address-based storage for next time
            storeTeamMembers(daoAddress, teamMembers);
            return teamMembers;
          }
        }
      }
    }

    return [];
  } catch (error) {
    console.error("Failed to retrieve team members:", error);
    return [];
  }
}

export function isTeamMember(daoAddress: string, accountId: string): boolean {
  const teamMembers = getTeamMembers(daoAddress);
  return teamMembers.includes(accountId);
}

/**
 * Migrate team members from name-based storage to address-based storage
 * This should be called when fetching DAO details
 */
export function migrateTeamMembers(walletAddress: string, daoName: string, daoAddress: string): void {
  const teamMembers = getTeamMembersByName(walletAddress, daoName);
  if (teamMembers.length > 0) {
    storeTeamMembers(daoAddress, teamMembers);
  }
}
