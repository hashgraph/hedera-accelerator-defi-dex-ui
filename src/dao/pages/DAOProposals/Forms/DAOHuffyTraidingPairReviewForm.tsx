import { Flex, Text, Box } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { CreateDAODexSettingsForm } from "../types";
import { useEffect, useState } from "react";
import { ContractId } from "@hashgraph/sdk";
import { DexService } from "@dex/services";
import { SINGLE_DAO_DEX_SETTINGS } from "@dao/config/singleDao";
import { ContractInterface, ethers } from "ethers";
import { solidityAddressToTokenIdString } from "@shared/utils";

function shortenAddress(address: string, startLength: number = 6, endLength: number = 4) {
  const addr = address.trim();
  if (addr.length <= startLength + endLength) return addr;
  const start = addr.slice(0, startLength);
  const end = addr.slice(-endLength);
  return `${start}...${end}`;
}

function useCurrentPairs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairs, setPairs] = useState<{ tokenA: string; tokenB: string }[]>([]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const cfg = SINGLE_DAO_DEX_SETTINGS?.pairWhitelist;
        const res: { tokenA: string; tokenB: string }[] = [];
        try {
          const address = ContractId.fromString(cfg?.contractId as string).toSolidityAddress();
          const { JsonRpcSigner } = DexService.getJsonRpcProviderAndSigner();
          const contract = new ethers.Contract(address, cfg?.abi as ContractInterface, JsonRpcSigner);
          const method = cfg?.methods?.getPairs || "getAllWhitelistedPairs";
          const out = await contract[method]();
          if (Array.isArray(out)) {
            for (const item of out) {
              try {
                // eslint-disable-next-line max-len
                const tokenIn =
                  typeof item?.tokenIn === "string" ? item.tokenIn : Array.isArray(item) ? item[0] : undefined;
                // eslint-disable-next-line max-len
                const tokenOut =
                  typeof item?.tokenOut === "string" ? item.tokenOut : Array.isArray(item) ? item[1] : undefined;
                if (typeof tokenIn === "string" && typeof tokenOut === "string") {
                  res.push({ tokenA: tokenIn, tokenB: tokenOut });
                }
              } catch {
                /* ignore */
              }
            }
          }
        } catch (e) {
          /* ignore */
        }
        if (!ignore) setPairs(res);
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "Failed to fetch current pairs");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, []);

  return { loading, error, pairs };
}

export function DAOHuffyTraidingPairReviewForm() {
  const { getValues } = useFormContext<CreateDAODexSettingsForm>();
  const formValues = getValues();
  const { pairs: currentPairs, loading: pairsLoading, error: pairsError } = useCurrentPairs();

  const additions = (formValues.whitelistAdd || []).filter((p) => (p?.tokenA || "").trim() && (p?.tokenB || "").trim());
  const removals = (formValues.whitelistRemove || []).filter(
    (p) => (p?.tokenA || "").trim() && (p?.tokenB || "").trim()
  );

  const [symbolMap, setSymbolMap] = useState<Record<string, string>>({});

  function toTokenId(input: string): string | undefined {
    const v = (input || "").trim();
    if (!v) return undefined;
    if ((ethers as any)?.utils?.isAddress?.(v)) return solidityAddressToTokenIdString(v);
    return v; // assume already HTS id
  }

  useEffect(() => {
    const uniqueValues = new Set<string>();
    currentPairs.forEach((p) => {
      if (p?.tokenA) uniqueValues.add(p.tokenA);
      if (p?.tokenB) uniqueValues.add(p.tokenB);
    });
    additions.forEach((p) => {
      if (p?.tokenA) uniqueValues.add((p.tokenA || "").trim());
      if (p?.tokenB) uniqueValues.add((p.tokenB || "").trim());
    });
    removals.forEach((p) => {
      if (p?.tokenA) uniqueValues.add((p.tokenA || "").trim());
      if (p?.tokenB) uniqueValues.add((p.tokenB || "").trim());
    });

    const toFetch = Array.from(uniqueValues).filter((k) => !symbolMap[k]);
    if (toFetch.length === 0) return;

    let ignore = false;
    (async () => {
      const entries: [string, string][] = [];
      for (const k of toFetch) {
        try {
          const tokenId = toTokenId(k);
          if (!tokenId || !tokenId.includes(".")) continue;
          const res = await DexService.fetchTokenData(tokenId);
          const sym = res?.data?.symbol;
          if (sym) entries.push([k, sym]);
        } catch {
          // ignore
        }
      }
      if (!ignore && entries.length > 0) {
        setSymbolMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    })();

    return () => {
      ignore = true;
    };
  }, [JSON.stringify(currentPairs), JSON.stringify(additions), JSON.stringify(removals)]);

  const renderLabel = (value: string) => {
    const v = (value || "").trim();
    const sym = symbolMap[v];
    const short = shortenAddress(v);
    return sym ? `${sym} (${short})` : short;
  };

  return (
    <Flex direction="column" gap="1.2rem">
      <Text fontWeight="bold">Review Changes</Text>
      <Box>
        <Text fontWeight="semibold" mb="2">
          Pair whitelist
        </Text>
        {pairsLoading && <Text color="gray.500">Loading current pairs…</Text>}
        {pairsError && <Text color="red.400">{pairsError}</Text>}
        <Box mb="2">
          <Text fontWeight="medium">Current pairs</Text>
          {currentPairs.length === 0 ? (
            <Text color="gray.500">(none)</Text>
          ) : (
            <Flex direction="column" gap="0.4rem">
              {currentPairs.map((p, idx) => (
                <Text key={`${p.tokenA}-${p.tokenB}-${idx}`}>
                  {renderLabel(p.tokenA)} — {renderLabel(p.tokenB)}
                </Text>
              ))}
            </Flex>
          )}
        </Box>

        {additions.length > 0 && (
          <Box mb="2">
            <Text fontWeight="medium">To add</Text>
            <Flex direction="column" gap="0.4rem">
              {additions.map((p, idx) => (
                <Text key={`a-${p.tokenA}-${p.tokenB}-${idx}`}>
                  {renderLabel(p.tokenA)} — {renderLabel(p.tokenB)}
                </Text>
              ))}
            </Flex>
          </Box>
        )}

        {removals.length > 0 && (
          <Box>
            <Text fontWeight="medium">To remove</Text>
            <Flex direction="column" gap="0.2rem">
              {removals.map((p, idx) => (
                <Text key={`r-${p.tokenA}-${p.tokenB}-${idx}`}>
                  {renderLabel(p.tokenA)} — {renderLabel(p.tokenB)}
                </Text>
              ))}
            </Flex>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
