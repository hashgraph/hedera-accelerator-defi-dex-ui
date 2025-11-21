import { Flex, Text, Box } from "@chakra-ui/react";
import { FormInput } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { CreateDAODexSettingsForm } from "../types";
import { DexService } from "@dex/services";
import { ContractId } from "@hashgraph/sdk";
import { SINGLE_DAO_DEX_SETTINGS } from "@dao/config/singleDao";
import { ethers } from "ethers";

function useParamStoreValues() {
  const cfg = SINGLE_DAO_DEX_SETTINGS?.parameterStore;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<{ maxTradeBps?: number; maxSlippageBps?: number; tradeCooldownSec?: number }>();

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!cfg?.contractId || !cfg?.abi) return;
      try {
        setLoading(true);
        setError(null);
        const address = ContractId.fromString(cfg.contractId).toSolidityAddress();
        const { JsonRpcSigner } = DexService.getJsonRpcProviderAndSigner();
        const contract = new ethers.Contract(address, cfg.abi, JsonRpcSigner);
        let maxTradeBps: number | undefined;
        let maxSlippageBps: number | undefined;
        let tradeCooldownSec: number | undefined;

        try {
          maxTradeBps = Number(await contract[cfg.methods!.maxTradeBps!]().toString());
          maxSlippageBps = Number(await contract[cfg.methods!.maxSlippageBps!]().toString());
          tradeCooldownSec = Number(await contract[cfg.methods!.tradeCooldownSec!]().toString());
        } catch {
          console.error("Failed to read maxTradeBps, maxSlippageBps or tradeCooldownSec from ParameterStore");
        }

        if (!maxTradeBps && !maxSlippageBps && !tradeCooldownSec) {
          try {
            const readAllMethod = cfg.methods?.getRiskParameters;
            const tuple = await contract[readAllMethod!]();
            if (Array.isArray(tuple) && tuple.length >= 3) {
              maxTradeBps = Number(tuple[0].toString());
              maxSlippageBps = Number(tuple[1].toString());
              tradeCooldownSec = Number(tuple[2].toString());
            }
          } catch {
            /* empty */
          }
        }
        if (!ignore) setValues({ maxTradeBps, maxSlippageBps, tradeCooldownSec });
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "Failed to read ParameterStore values");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [cfg?.contractId, JSON.stringify(cfg?.abi), JSON.stringify(cfg?.methods)]);

  return { loading, error, values };
}

export function DAOHuffyRiskParamsDetailsForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateDAODexSettingsForm>();
  const { values, loading, error } = useParamStoreValues();
  const minMax = SINGLE_DAO_DEX_SETTINGS?.parameterStore?.minMax;

  const helper = useMemo(
    () => ({
      maxTradeBps: {
        min: minMax?.maxTradeBps?.min ?? 0,
        max: minMax?.maxTradeBps?.max ?? 10000,
      },
      maxSlippageBps: {
        min: minMax?.maxSlippageBps?.min ?? 0,
        max: minMax?.maxSlippageBps?.max ?? 10000,
      },
      tradeCooldownSec: {
        min: minMax?.tradeCooldownSec?.min ?? 0,
        max: minMax?.tradeCooldownSec?.max ?? 604800,
      },
    }),
    [JSON.stringify(minMax)]
  );

  return (
    <Flex direction="column" gap="1.3rem">
      <Text fontWeight="bold">Set a risk parameters</Text>
      {loading && <Text color="gray.500">Loading current values…</Text>}
      {error && <Text color="red.400">{error}</Text>}
      <Box>
        <Text fontWeight="semibold" mb="2">
          current values
        </Text>
        {values ? (
          <Flex direction="column" gap="0.4rem">
            <Text>Max Trade (bps): {typeof values.maxTradeBps === "number" ? values.maxTradeBps : "-"}</Text>
            <Text>Max Slippage (bps): {typeof values.maxSlippageBps === "number" ? values.maxSlippageBps : "-"}</Text>
            {/* eslint-disable-next-line max-len */}
            <Text>
              Trade Cooldown (sec): {typeof values.tradeCooldownSec === "number" ? values.tradeCooldownSec : "-"}
            </Text>
          </Flex>
        ) : (
          <Text color="gray.500">Not available.</Text>
        )}
      </Box>
      <FormInput<"maxTradeBps">
        inputProps={{
          id: "maxTradeBps",
          label: `Max Trade (bps)`,
          type: "number",
          placeholder: "e.g. 1000",
          register: {
            ...register("maxTradeBps", {
              setValueAs: (v) => (v === "" || v === null || typeof v === "undefined" ? undefined : Number(v)),
              validate: (v) => {
                if (v === undefined) return true;
                if (typeof v !== "number" || isNaN(v)) return "Invalid number";
                if (v < helper.maxTradeBps.min) return `Min ${helper.maxTradeBps.min}`;
                if (v > helper.maxTradeBps.max) return `Max ${helper.maxTradeBps.max}`;
                return true;
              },
            }),
          },
        }}
        isInvalid={Boolean(errors?.maxTradeBps)}
        errorMessage={errors?.maxTradeBps && String(errors?.maxTradeBps?.message)}
      />
      <FormInput<"maxSlippageBps">
        inputProps={{
          id: "maxSlippageBps",
          label: `Max Slippage (bps)`,
          type: "number",
          placeholder: "e.g. 100",
          register: {
            ...register("maxSlippageBps", {
              setValueAs: (v) => (v === "" || v === null || typeof v === "undefined" ? undefined : Number(v)),
              validate: (v) => {
                if (v === undefined) return true;
                if (typeof v !== "number" || isNaN(v)) return "Invalid number";
                if (v < helper.maxSlippageBps.min) return `Min ${helper.maxSlippageBps.min}`;
                if (v > helper.maxSlippageBps.max) return `Max ${helper.maxSlippageBps.max}`;
                return true;
              },
            }),
          },
        }}
        isInvalid={Boolean(errors?.maxSlippageBps)}
        errorMessage={errors?.maxSlippageBps && String(errors?.maxSlippageBps?.message)}
      />
      <FormInput<"tradeCooldownSec">
        inputProps={{
          id: "tradeCooldownSec",
          label: `Trade Cooldown (sec)`,
          type: "number",
          placeholder: "e.g. 60",
          register: {
            ...register("tradeCooldownSec", {
              setValueAs: (v) => (v === "" || v === null || typeof v === "undefined" ? undefined : Number(v)),
              validate: (v) => {
                if (v === undefined) return true;
                if (typeof v !== "number" || isNaN(v)) return "Invalid number";
                if (v < helper.tradeCooldownSec.min) return `Min ${helper.tradeCooldownSec.min}`;
                if (v > helper.tradeCooldownSec.max) return `Max ${helper.tradeCooldownSec.max}`;
                return true;
              },
            }),
          },
        }}
        isInvalid={Boolean(errors?.tradeCooldownSec)}
        errorMessage={errors?.tradeCooldownSec && String(errors?.tradeCooldownSec?.message)}
      />
    </Flex>
  );
}
