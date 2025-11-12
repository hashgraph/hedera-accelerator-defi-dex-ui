import { useEffect, useState } from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import { FormInput } from "@shared/ui-kit";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateDAODexSettingsForm } from "../types";
import { DexService } from "@dex/services";
import { ContractId } from "@hashgraph/sdk";
import { SINGLE_DAO_DEX_SETTINGS } from "@dao/config/singleDao";
import { ContractInterface, ethers } from "ethers";
import { TokenId } from "@hashgraph/sdk";

function shortenAddress(address: string, startLength: number = 6, endLength: number = 4) {
  const addr = address.trim();
  if (addr.length <= startLength + endLength) return addr;
  const start = addr.slice(0, startLength);
  const end = addr.slice(-endLength);
  return `${start}...${end}`;
}

async function validateAddress(input: string): Promise<true | string> {
  const v = (input || "").trim();
  if (!v) return "Required";
  if ((ethers as any)?.utils?.isAddress?.(v)) return true;
  try {
    TokenId.fromString(v);
    return true;
  } catch {
    /* ignore */
  }
  return "Invalid address. Enter EVM (0x...) or HTS (0.0.x) token address.";
}

export function DAOHuffyRemoveTradingPairForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateDAODexSettingsForm>();
  const [currentPairs, setCurrentPairs] = useState<{ tokenA: string; tokenB: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    fields: removeFields,
    append: removeAppend,
    remove: removeRemove,
  } = useFieldArray({ control, name: "whitelistRemove" });

  useEffect(() => {
    if (removeFields.length === 0) removeAppend({ tokenA: "", tokenB: "" });
    if (removeFields.length > 1) {
      for (let i = removeFields.length - 1; i >= 1; i--) removeRemove(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeFields.length]);

  useEffect(() => {
    let ignore = false;
    async function loadPairs() {
      try {
        setLoading(true);
        setError(null);
        const cfg = SINGLE_DAO_DEX_SETTINGS?.pairWhitelist;
        const pairs: { tokenA: string; tokenB: string }[] = [];
        try {
          const address = ContractId.fromString(cfg?.contractId as string).toSolidityAddress();
          const { JsonRpcSigner } = DexService.getJsonRpcProviderAndSigner();
          const contract = new ethers.Contract(address, cfg?.abi as ContractInterface, JsonRpcSigner);
          const method = cfg?.methods?.getPairs || "getAllWhitelistedPairs";
          const res = await contract[method]();
          if (Array.isArray(res)) {
            for (const item of res) {
              try {
                // eslint-disable-next-line max-len
                const tokenIn =
                  typeof item?.tokenIn === "string" ? item.tokenIn : Array.isArray(item) ? item[0] : undefined;
                // eslint-disable-next-line max-len
                const tokenOut =
                  typeof item?.tokenOut === "string" ? item.tokenOut : Array.isArray(item) ? item[1] : undefined;
                if (typeof tokenIn === "string" && typeof tokenOut === "string") {
                  pairs.push({ tokenA: tokenIn, tokenB: tokenOut });
                }
              } catch {
                /* ignore */
              }
            }
          }
        } catch (e) {
          /* ignore */
        }
        if (!ignore) setCurrentPairs(pairs);
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "Failed to fetch current pairs");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadPairs();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Flex direction="column" gap="1.3rem">
      <Text fontWeight="bold">Update a trading pairs</Text>
      {loading && <Text color="gray.500">Loading current pairs…</Text>}
      {error && <Text color="red.400">{error}</Text>}
      <Box>
        <Text fontWeight="semibold" mb="2">
          current values
        </Text>
        {currentPairs.length === 0 ? (
          <Text color="gray.500">No pairs found.</Text>
        ) : (
          <Flex direction="column" gap="0.4rem">
            {currentPairs.map((p, idx) => (
              // eslint-disable-next-line max-len
              <Text key={`${p.tokenA}-${p.tokenB}-${idx}`}>
                {shortenAddress(p.tokenA)} — {shortenAddress(p.tokenB)}
              </Text>
            ))}
          </Flex>
        )}
      </Box>

      <Box>
        <Text fontWeight="semibold" mb="2">
          Pairs to remove
        </Text>
        <Flex direction="column" gap="0.8rem">
          {removeFields.map((field, index) => (
            <Flex key={field.id} direction="row" gap="0.6rem" align="flex-start">
              <FormInput<{ tokenA: string } & any>
                inputProps={{
                  id: `whitelistRemove.${index}.tokenA`,
                  label: `Token A (EVM or HTS address)`,
                  type: "text",
                  placeholder: "e.g. 0xabc... or 0.0.123",
                  register: {
                    ...register(`whitelistRemove.${index}.tokenA` as const, {
                      required: { value: true, message: "Required" },
                      validate: async (v) => validateAddress(v),
                    }),
                  },
                }}
                isInvalid={Boolean((errors as any)?.whitelistRemove?.[index]?.tokenA)}
                errorMessage={(errors as any)?.whitelistRemove?.[index]?.tokenA?.message as string}
              />
              <FormInput<{ tokenB: string } & any>
                inputProps={{
                  id: `whitelistRemove.${index}.tokenB`,
                  label: `Token B (EVM or HTS address)`,
                  type: "text",
                  placeholder: "e.g. 0xdef... or 0.0.456",
                  register: {
                    ...register(`whitelistRemove.${index}.tokenB` as const, {
                      required: { value: true, message: "Required" },
                      validate: async (v) => validateAddress(v),
                    }),
                  },
                }}
                isInvalid={Boolean((errors as any)?.whitelistRemove?.[index]?.tokenB)}
                errorMessage={(errors as any)?.whitelistRemove?.[index]?.tokenB?.message as string}
              />
            </Flex>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}
