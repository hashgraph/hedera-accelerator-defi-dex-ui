import { Flex, Text, Box } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { CreateDAODexSettingsForm } from "../types";
import { useEffect, useState } from "react";
import { ContractId } from "@hashgraph/sdk";
import { DexService } from "@dex/services";
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
          if (cfg.methods?.maxTradeBps) {
            const v = await contract[cfg.methods.maxTradeBps]();
            maxTradeBps = Number(v.toString());
          }
        } catch {
          /* empty */
        }
        try {
          if (cfg.methods?.maxSlippageBps) {
            const v = await contract[cfg.methods.maxSlippageBps]();
            maxSlippageBps = Number(v.toString());
          }
        } catch {
          /* empty */
        }
        try {
          if (cfg.methods?.tradeCooldownSec) {
            const v = await contract[cfg.methods.tradeCooldownSec]();
            tradeCooldownSec = Number(v.toString());
          }
        } catch {
          /* empty */
        }
        if (!maxTradeBps && !maxSlippageBps && !tradeCooldownSec) {
          try {
            const readAllMethod = cfg.methods?.readAll || "getRiskParameters";
            const tuple = await contract[readAllMethod]();
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

export function DAOHuffyRiskParamsReviewForm() {
  const { getValues } = useFormContext<CreateDAODexSettingsForm>();
  const formValues = getValues();
  const { values: currentParams, loading: paramsLoading, error: paramsError } = useParamStoreValues();

  const displayMaxTrade =
    formValues.maxTradeBps === undefined ||
    (currentParams?.maxTradeBps !== undefined && formValues.maxTradeBps === currentParams.maxTradeBps)
      ? "(no changes)"
      : formValues.maxTradeBps;
  const displayMaxSlippage =
    formValues.maxSlippageBps === undefined ||
    (currentParams?.maxSlippageBps !== undefined && formValues.maxSlippageBps === currentParams.maxSlippageBps)
      ? "(no changes)"
      : formValues.maxSlippageBps;
  const displayCooldown =
    formValues.tradeCooldownSec === undefined ||
    (currentParams?.tradeCooldownSec !== undefined && formValues.tradeCooldownSec === currentParams.tradeCooldownSec)
      ? "(no changes)"
      : formValues.tradeCooldownSec;

  return (
    <Flex direction="column" gap="1.2rem">
      <Text fontWeight="bold">Review Changes</Text>

      <Box>
        <Text fontWeight="semibold" mb="2">
          Parameters
        </Text>
        {paramsLoading && <Text color="gray.500">Loading current values…</Text>}
        {paramsError && <Text color="red.400">{paramsError}</Text>}
        <Flex direction="column" gap="0.4rem">
          <Text>
            maxTradeBps: {currentParams?.maxTradeBps ?? "?"} → {displayMaxTrade}
          </Text>
          <Text>
            maxSlippageBps: {currentParams?.maxSlippageBps ?? "?"} → {displayMaxSlippage}
          </Text>
          <Text>
            tradeCooldownSec: {currentParams?.tradeCooldownSec ?? "?"} → {displayCooldown}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}
