# How to add a new Governance proposal type

This guide explains how to register a brand‑new proposal type so that:
- It appears in the New Proposal wizard (after clicking “New Proposal”).
- It has its own details/configuration steps and submit flow.
- It is correctly parsed from on‑chain data and visible in the proposals list and details page with its unique fields.

The examples below reference current “Huffy” proposal types as working patterns you can copy.

Terminology note:
- DAOProposalType = UI/Wizard type selector for creating proposals (front-end only)
- GovernanceProposalType = numeric type emitted/consumed by the governor smart contract (on‑chain)
- ProposalType (dao/hooks/types.ts) = front-end type used when listing/reading proposals

## 0) Integrate the new smart contract (ABI + contract ID + wiring)

Most new proposal types start by integrating the on-chain contract they will call. Do this first. If your proposal reuses existing contracts, you can skip this sub-step and go to the data/type wiring.

0a) Add the ABI file
- Place the contract ABI JSON under: src\dao\config\abi
- Naming: PascalCaseName.json (e.g. SetFeeModule.json)

0b) Add an environment variable for the contract ID
- Edit .env (and .env.example in your PR) and add a VITE_..._CONTRACT_ID for your contract
- Hedera format: 0.0.x
Example:
```
# VITE_SET_FEE_CONTRACT_ID=0.0.1234567
```

0c) Wire it in code:
src/dao/config/singleDao.ts
- Import your ABI and add a small config entry alongside parameterStore/pairWhitelist.
- If you want strict typing, extend DexSettingsConfig to add your section (optional). If you don’t want to change types, you can export a helper constant/function.
Example (centralized constant):
```ts
// src/dao/config/singleDao.ts
import SetFeeModule from "./abi/SetFeeModule.json";
const SET_FEE_CONTRACT_ID: string | undefined = import.meta.env.VITE_SET_FEE_CONTRACT_ID?.trim();

export const SINGLE_DAO_SET_FEE_MODULE = {
  contractId: SET_FEE_CONTRACT_ID,
  abi: (SetFeeModule as any).abi,
  methods: { proposeSetFee: "proposeSetFee" },
} as const;
```

Now, decide the shape of your new proposal data
Create a small plan of what user inputs are needed to create the proposal and what data is expected back from the chain when reading the proposal. You’ll map these in steps 1, 3, and 5.

Example: A “Set Fee” proposal might need inputs: feeBps: number, receiver: string.

---

## 1) Extend front-end types (read side)

File: src\dao\hooks\types.ts
- If your proposal will show custom data in lists/details, add an interface for it and include it in ProposalData union.

Example additions:

```ts
// 1a) Add a readable ProposalType label if needed
export enum ProposalType {
  // ...existing
  SetFeeProposal = "Set Fee", // NEW
}

// 1b) Define the data shape as it will be displayed by the UI
export interface GOVSetFeeProposalDetails {
  feeBps: number;
  receiver: string;
}

// 1c) Add it to the ProposalData union
export type ProposalData =
  | GOVHuffyTraidingPairProposalDetails
  | GOVHuffyRiskParametersProposalDetails
  | GOVSetFeeProposalDetails; // NEW
```

Why: The list and details UIs rely on Proposal.type and Proposal.data to render custom info.

---

## 2) Make it selectable in the New Proposal wizard

Files:
- src\dao\pages\DAOProposals\types.ts
- src\dao\pages\DAOProposals\Forms\DAOProposalTypeForm.tsx

2a) Add a new option to the wizard type enum

File: src\dao\pages\DAOProposals\types.ts
```ts
export enum DAOProposalType {
  // ...existing
  SetFeeProposal = "Set fee", // NEW (this is the label shown in the wizard)
}
```

2b) Show it on the type selection screen

File: src\dao\pages\DAOProposals\Forms\DAOProposalTypeForm.tsx
- Add an entry to the HuffyProposals (or returned array from getProposalsArray()).

```tsx
const HuffyProposals = [
  // ...existing
  {
    title: DAOProposalType.SetFeeProposal, // NEW
    label: "Set the protocol fee and its receiver.",
    icon: <SettingsToolIcon boxSize="4" color={Color.Grey_Blue._500} marginTop="0.2rem" />,
  },
];
```

Now your type appears when clicking “New Proposal”. Next you need to wire its steps and submit logic.

---

## 3) Add the wizard steps (Details/Config/Review) and submission

Files:
- src\dao\routes\routes.ts
- src\dao\routes\router.tsx
- src\dao\pages\DAOProposals\CreateDAOProposal.tsx
- Create your forms under: src\dao\pages\DAOProposals\Forms\

3a) Define routes for your new forms

File: src\dao\routes\routes.ts
```ts
export const Routes = {
  // ...existing
  DAOSetFeeDetails: "huffy-settings/set-fee/details",    // NEW
  DAOSetFeeReview:  "huffy-settings/set-fee/review",     // NEW
};
```

File: src\dao\routes\router.tsx
```tsx
<Route path={Routes.CreateDAOProposal} element={<Pages.CreateDAOProposal />}>
  {/* ...existing */}
  <Route path={Routes.DAOSetFeeDetails} element={<Pages.DAOSetFeeDetailsForm />} />   {/* NEW */}
  <Route path={Routes.DAOSetFeeReview} element={<Pages.DAOSetFeeReviewForm />} />     {/* NEW */}
</Route>
```

3b) Create your forms

Create two new components by following existing ones as templates:
- src\dao\pages\DAOProposals\Forms\DAOSetFeeDetailsForm.tsx
- src\dao\pages\DAOProposals\Forms\DAOSetFeeReviewForm.tsx

Use the Huffy forms as references:
- DAOHuffyDetailsForm.tsx (generic details: title, description, link)
- DAOHuffyRiskParamsDetailsForm.tsx (configuration step)
- DAOHuffyRiskParamsReviewForm.tsx (review + submit)

3c) Register your wizard steps and submit mutation

File: src\dao\pages\DAOProposals\CreateDAOProposal.tsx
- Add a case for your DAOProposalType in the steps switch to wire your routes.
- Add a case in the submit section that calls the correct mutation/hook.

Examples to copy from:
- Steps: see cases for HuffyRiskParametersProposal / HuffyAddTradingPairProposal.
- Submit: search for mutate calls: createHuffyRiskParametersProposal / createHuffyAddTradingPairProposal / createHuffyRemoveTradingPairProposal.

If your proposal requires a new backend mutation, implement a hook similar to:
- src\dao\hooks\useCreateHuffyRiskParametersProposal.ts
- src\dao\hooks\useCreateHuffyAddTradingPairProposal.ts
- src\dao\hooks\useCreateHuffyRemoveTradingPairProposal.ts

Name it e.g. src\dao\hooks\useCreateSetFeeProposal.ts and integrate it in CreateDAOProposal.tsx like the existing ones (loading/error handling and reset on success).

---

## 4) Map the on-chain type (write/read contract ID)

If your new proposal is a new on‑chain type, add a numeric identifier in the contract and then map it in the front-end.

File: src\dex\store\governanceSlice\type.ts
```ts
enum GovernanceProposalType {
  // ...existing
  SetFeeProposal = 2004, // NEW – choose an unused id coordinated with the smart contract
}
```

Then:
- When creating a proposal (your submit hook), ensure this numeric type is sent to the contract.
- When reading proposals, convert numeric GovernanceProposalType to the human label (ProposalType) and parse data.

---

## 5) Parse and attach your new proposal’s data when reading

Files:
- src\dao\hooks\useGovernanceDAOProposals.tsx (main list for Governance/NFT DAOs)
- optionally src\dao\hooks\useDAOProposals.tsx (if using logs path)

5a) Return the right Proposal.type and Proposal.data

File: src\dao\hooks\useGovernanceDAOProposals.tsx
- Extend getProposalType
```ts
const getProposalType = (type: GovernanceProposalType) => {
  switch (Number(type)) {
    // ...existing
    case GovernanceProposalType.SetFeeProposal:
      return ProposalType.SetFeeProposal; // NEW (from dao/hooks/types.ts)
    default:
      return ProposalType.GenericProposal;
  }
};
```

- Extend getFormattedProposalData
```ts
const getFormattedProposalData = (proposalType: number, proposalData: ProposalData) => {
  switch (proposalType) {
    // ...existing
    case GovernanceProposalType.SetFeeProposal:
      return {
        feeBps: proposalData.feeBps ?? 0,
        receiver: proposalData.receiver ?? "",
      };
    default:
      return undefined;
  }
};
```

- Ensure the returned Proposal object’s `data` is set to your details object and `type` uses your new ProposalType.

5b) (Optional) If you use the logs-based reader

File: src\dao\hooks\useDAOProposals.tsx
- Add a case similar to existing ones (Risk/Add/Remove Trading Pair) to populate `preparedData` and set `type` correctly.

---

## 6) Render the unique fields in the list card and details

Files:
- src\dao\pages\utils.ts → getProposalData
- src\dao\pages\ProposalCard.tsx
- src\dao\pages\ProposalDetailsPage\* (Header/Components)

6a) Provide a short one‑line description for cards and details headers

File: src\dao\pages\utils.ts
```ts
export function getProposalData(proposal: Proposal): string {
  switch (proposal.type) {
    case ProposalType.SetFeeProposal: {
      const data = proposal.data as GOVSetFeeProposalDetails | undefined;
      if (!data) return "";
      return `Set fee: ${data.feeBps} bps → receiver ${data.receiver}`;
    }
    // ...existing
    default:
      return "";
  }
}
```

This text is used by:
- Proposal cards (src\dao\pages\ProposalCard.tsx)
- Proposal details hook (subDescription in useGovernanceProposalDetails.tsx)

6b) If you need a custom section on the details page
Add a new visual block in:
- src\dao\pages\ProposalDetailsPage\ProposalDetails.tsx and/or
- src\dao\pages\ProposalDetailsPage\ProposalDetailsComponents\*

Follow existing patterns for “Huffy” proposals to render custom fields when `proposal.type === ProposalType.YourNewType`.

---

## 7) Submit logic: create hook and call mutation

Create a new hook to perform the contract call.

Example file to copy:
- src\dao\hooks\useCreateHuffyRiskParametersProposal.ts

Your new hook should:
- Receive the form data (title, description, link, and your custom fields)
- Encode call data and call the governor contract
- Call the provided onSuccess callback so CreateDAOProposal can reset and navigate

Wire that hook into CreateDAOProposal.tsx under your DAOProposalType’s Review step.

## 8) Quick reference: key files to touch

Contract integration
- src\dao\config\abi (place the ABI JSON)
- .env and .env.example (add VITE_..._CONTRACT_ID)
- src\dao\config\singleDao.ts or your hooks (wire ABI + contractId)

Creation flow
- src\dao\pages\DAOProposals\types.ts (DAOProposalType enum, CreateDAOProposalForm shape)
- src\dao\pages\DAOProposals\Forms\DAOProposalTypeForm.tsx (shows type options)
- src\dao\routes\routes.ts (route constants for steps)
- src\dao\routes\router.tsx (Routes → Components mapping)
- src\dao\pages\DAOProposals\CreateDAOProposal.tsx (wizard steps + submit)
- src\dao\hooks\useCreate*.ts (your create hook)

Read/Display
- src\dao\hooks\types.ts (ProposalType + ProposalData interfaces)
- src\dex\store\governanceSlice\type.ts (GovernanceProposalType numeric id)
- src\dao\hooks\useGovernanceDAOProposals.tsx (map on‑chain → Proposal.type + Proposal.data)
- src\dao\hooks\useDAOProposals.tsx (logs reader – optional)
- src\dao\pages\utils.ts (getProposalData for list/details subtitle)
- src\dao\pages\ProposalCard.tsx and src\dao\pages\ProposalDetailsPage\* (rendering)
