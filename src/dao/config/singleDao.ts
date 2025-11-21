import { Routes } from "@dao/routes";
import type { ContractInterface } from "ethers";
import ParameterStore from "./abi/ParameterStore.json";
import PairWhitelist from "./abi/PairWhitelist.json";

export const SINGLE_DAO_ID: string = import.meta.env.VITE_SINGLE_DAO_ID.trim();

const PARAMETER_STORE_CONTRACT_ID: string = import.meta.env.VITE_PARAMETER_STORE_CONTRACT_ID.trim();
const PAIR_WHITELIST_CONTRACT_ID: string = import.meta.env.VITE_PAIR_WHITELIST_CONTRACT_ID.trim();

export const DEFAULT_DAO_OVERVIEW_PATH = `/${Routes.Overview}`;

export type DexMinMax = { min?: number; max?: number };
export type DexSettingsConfig = {
  parameterStore?: {
    contractId?: string;
    abi?: ContractInterface;
    methods?: {
      maxTradeBps?: string;
      maxSlippageBps?: string;
      tradeCooldownSec?: string;
      getRiskParameters?: string;
    };
    minMax?: {
      maxTradeBps?: DexMinMax;
      maxSlippageBps?: DexMinMax;
      tradeCooldownSec?: DexMinMax;
    };
  };
  pairWhitelist?: {
    contractId?: string;
    abi?: ContractInterface;
    methods?: {
      getPairs?: string;
      removePair?: string;
      addPair?: string;
    };
  };
};

export const SINGLE_DAO_DEX_SETTINGS: DexSettingsConfig = {
  parameterStore: {
    contractId: PARAMETER_STORE_CONTRACT_ID,
    abi: (ParameterStore as any).abi,
    methods: {
      maxTradeBps: "maxTradeBps",
      maxSlippageBps: "maxSlippageBps",
      tradeCooldownSec: "tradeCooldownSec",
      getRiskParameters: "getRiskParameters",
    },
    minMax: {
      maxTradeBps: { min: 0, max: 10000 },
      maxSlippageBps: { min: 0, max: 10000 },
      tradeCooldownSec: { min: 0, max: 604800 },
    },
  },
  pairWhitelist: {
    contractId: PAIR_WHITELIST_CONTRACT_ID,
    abi: (PairWhitelist as any).abi,
    methods: {
      getPairs: "getAllWhitelistedPairs",
      removePair: "removePair",
      addPair: "addPair",
    },
  },
};
