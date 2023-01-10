import { BigNumber } from "bignumber.js";
import { AccountId, TokenId, ContractId } from "@hashgraph/sdk";
import { WalletService, HederaService, MirrorNodeService } from "../../services";
import { getErrorMessage } from "../../utils";
import { SwapActionType, SwapSlice, SwapStore, SwapState, Token, TokenPair } from "./types";

const initialSwapState: SwapState = {
  precision: undefined,
  fee: undefined,
  spotPrices: {},
  poolLiquidity: {},
  errorMessage: null,
  selectedAccount: {
    selectedAccountId: null,
    selectedAToBRoute: null,
    selectedBToARoute: null,
  },
  transactionState: {
    transactionWaitingToBeSigned: false,
    successPayload: null,
    errorMessage: "",
  },
  tokenPairs: null,
};

const fetchEachToken = async (evmAddress: string) => {
  const pairData = await MirrorNodeService.fetchContract(evmAddress);
  const pairContractId = ContractId.fromString(pairData.data.contract_id);
  const { tokenAAddress, tokenBAddress, tokenCAddress } = await HederaService.getTokenPairAddress(pairContractId);

  const [tokenAInfo, tokenBInfo, tokenCInfo] = await Promise.all([
    MirrorNodeService.fetchTokenData(tokenAAddress),
    MirrorNodeService.fetchTokenData(tokenBAddress),
    MirrorNodeService.fetchTokenData(tokenCAddress),
  ]);

  const tokenAInfoDetails: Token = {
    amount: 0.0,
    displayAmount: "",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: tokenAInfo.data.name,
    totalSupply: tokenAInfo.data.total_supply,
    maxSupply: null,
    symbol: tokenAInfo.data.symbol,
    tokenMeta: {
      pairAccountId: pairData.data.contract_id,
      tokenId: tokenAInfo.data.token_id,
    },
  };

  const tokenBInfoDetails: Token = {
    amount: 0.0,
    displayAmount: "",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: tokenBInfo.data.name,
    totalSupply: tokenBInfo.data.total_supply,
    maxSupply: null,
    symbol: tokenBInfo.data.symbol,
    tokenMeta: {
      pairAccountId: pairData.data.contract_id,
      tokenId: tokenBInfo.data.token_id,
    },
  };
  const pairToken = {
    symbol: tokenCInfo.data.symbol,
    pairLpAccountId: tokenCAddress,
    totalSupply: tokenCInfo.data.total_supply,
    decimals: tokenCInfo.data.decimals,
  };
  const updated: TokenPair = {
    pairToken,
    tokenA: tokenAInfoDetails,
    tokenB: tokenBInfoDetails,
  };
  return updated;
};

/**
 *
 * @returns
 */

const createSwapSlice: SwapSlice = (set, get): SwapStore => {
  return {
    ...initialSwapState,
    getPrecision: async () => {
      const { swap } = get();
      const { selectedAccountId } = swap.selectedAccount;
      try {
        const contractId = ContractId.fromString(selectedAccountId ?? "");
        const precision = await HederaService.fetchPrecision(contractId);
        set(
          ({ swap }) => {
            swap.precision = precision;
          },
          false,
          SwapActionType.SET_PRECISION
        );
      } catch {
        // TODO: A fix for To get Precision and get The UI working when no account is selected
        const precision = HederaService.getPrecision();
        set(
          ({ swap }) => {
            swap.precision = precision;
          },
          false,
          SwapActionType.SET_PRECISION
        );
      }
    },
    setSelectedAccount: (accountId: string, tokenToTradeAId: string, tokenToTradeBId: string) => {
      set(
        ({ swap }) => {
          swap.selectedAccount.selectedAccountId = accountId;
          swap.selectedAccount.selectedAToBRoute = `${tokenToTradeAId}=>${tokenToTradeBId}`;
          swap.selectedAccount.selectedBToARoute = `${tokenToTradeBId}=>${tokenToTradeAId}`;
        },
        false,
        SwapActionType.SET_SELECTED_ACCOUNT_ID
      );
    },
    fetchTokenPairs: async () => {
      set({}, false, SwapActionType.FETCH_TOKEN_PAIRS_STARTED);
      const { app } = get();
      app.setFeaturesAsLoading(["tokenPairs"]);
      try {
        const pairsAddresses = await HederaService.fetchTokenPairs();
        const urlRequest = pairsAddresses?.map((address) => fetchEachToken(address)) ?? [];
        const pairs = await Promise.all(urlRequest);
        set(
          ({ swap }) => {
            swap.tokenPairs = pairs;
          },
          false,
          SwapActionType.FETCH_TOKEN_PAIRS_SUCCEEDED
        );
        app.setFeaturesAsLoaded(["tokenPairs"]);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        app.setFeaturesAsLoaded(["tokenPairs"]);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_TOKEN_PAIRS_FAILED
        );
      }
    },
    /**
     * Fetches the spot price for swapping L49A tokens for L49B tokens.
     *
     * TODO: This action should be updated to dynamically request spot prices based
     * on two different token symbols. This requires an update to the Swap contract spot price
     * function to support token symbol parameters.
     */
    fetchSpotPrices: async () => {
      const { swap, app } = get();
      const { selectedAccountId, selectedAToBRoute, selectedBToARoute } = swap.selectedAccount;
      if (!selectedAccountId || !selectedAToBRoute || !selectedBToARoute) {
        return;
      }
      set({}, false, SwapActionType.FETCH_SPOT_PRICES_STARTED);
      app.setFeaturesAsLoading(["spotPrices"]);
      try {
        const { precision } = swap;
        if (precision === undefined) {
          throw Error("Precision not found");
        }
        const spotPriceL49BToL49A = await HederaService.getSpotPrice(selectedAccountId);
        const spotPriceL49AToL49B = spotPriceL49BToL49A ? BigNumber(1).dividedBy(spotPriceL49BToL49A) : undefined;
        const spotPriceL49AToL49BWithPrecision = spotPriceL49AToL49B ? spotPriceL49AToL49B.times(precision) : undefined;
        const spotPriceL49BToL49AWithPrecision = spotPriceL49BToL49A
          ? spotPriceL49BToL49A.dividedBy(precision)
          : undefined;
        set(
          ({ swap }) => {
            swap.spotPrices[selectedAToBRoute] = spotPriceL49AToL49BWithPrecision;
            swap.spotPrices[selectedBToARoute] = spotPriceL49BToL49AWithPrecision;
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_FAILED
        );
      }
      app.setFeaturesAsLoaded(["spotPrices"]);
    },
    fetchFee: async () => {
      const { app, swap } = get();
      const { selectedAccountId } = swap.selectedAccount;
      if (!selectedAccountId) {
        return;
      }
      app.setFeaturesAsLoading(["fee"]);
      set({}, false, SwapActionType.FETCH_SWAP_FEE_STARTED);
      try {
        const fee = await HederaService.fetchFeeWithPrecision(selectedAccountId);
        set(
          ({ swap }) => {
            swap.fee = fee;
          },
          false,
          SwapActionType.FETCH_SWAP_FEE_SUCCEEDED
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_SWAP_FEE_FAILED
        );
      }
      app.setFeaturesAsLoaded(["fee"]);
    },
    // TODO: need to pass in contract address of pool (to pass to pairCurrentPosition)
    getPoolLiquidity: async (tokenToTrade: Token, tokenToReceive: Token) => {
      console.log(`Getting pool liquidity
       ${JSON.stringify(tokenToTrade, null, 2)} and 
       ${JSON.stringify(tokenToReceive, null, 2)}`);
      const { swap, app } = get();

      if (tokenToReceive.tokenMeta.pairAccountId !== tokenToTrade.tokenMeta.pairAccountId) {
        swap.errorMessage = "Swap Tokens not available for selected tokens";
        return;
      }

      /** poolLiquidity should be updated to be tracked by unique account id pairs instead of token symbols */
      app.setFeaturesAsLoading(["poolLiquidity"]);
      set({}, false, SwapActionType.FETCH_POOL_LIQUIDITY_STARTED);
      try {
        const poolLiquidity = new Map<string, BigNumber | undefined>();
        // TODO: In below Contract call we are directly returining the hard coded
        const contractId = ContractId.fromString(tokenToReceive.tokenMeta.pairAccountId ?? "");
        const { tokenAAddress } = await HederaService.getTokenPairAddress(
          ContractId.fromString(tokenToTrade.tokenMeta.pairAccountId ?? "")
        );
        const rawPoolLiquidity = await HederaService.pairCurrentPosition(contractId);

        let tokens: { [x: string]: BigNumber } = {};
        if (tokenAAddress === tokenToTrade.tokenMeta.tokenId) {
          tokens = {
            [tokenToTrade.symbol ?? ""]: rawPoolLiquidity.tokenAQty,
            [tokenToReceive.symbol ?? ""]: rawPoolLiquidity.tokenBQty,
          };
        } else {
          tokens = {
            [tokenToTrade.symbol ?? ""]: rawPoolLiquidity.tokenBQty,
            [tokenToReceive.symbol ?? ""]: rawPoolLiquidity.tokenAQty,
          };
        }

        Object.keys(tokens).forEach((tokenSymbol) => {
          if (swap.precision === undefined) {
            throw Error("Precision not found");
          }
          const amount = tokens[tokenSymbol];
          poolLiquidity.set(tokenSymbol, amount?.dividedBy(swap.precision.times(10)));
        });
        set(
          ({ swap }) => {
            swap.poolLiquidity = Object.fromEntries(poolLiquidity);
          },
          false,
          SwapActionType.FETCH_POOL_LIQUIDITY_SUCCEEDED
        );
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        set(
          ({ swap }) => {
            swap.errorMessage = errorMessage;
          },
          false,
          SwapActionType.FETCH_SPOT_PRICES_FAILED
        );
      }
      app.setFeaturesAsLoaded(["poolLiquidity"]);
    },
    sendSwapTransaction: async (tokenToTrade: Token) => {
      const { context, wallet, app } = get();
      app.setFeaturesAsLoading(["transactionState"]);
      set(
        ({ swap }) => {
          swap.transactionState = initialSwapState.transactionState;
        },
        false,
        SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_STARTED
      );
      const tokenToTradeAccountId = tokenToTrade.tokenMeta.tokenId ?? "";
      const signingAccount = wallet.savedPairingData?.accountIds[0] ?? "";
      const contractId = ContractId.fromString(tokenToTrade.tokenMeta.pairAccountId ?? "");
      const walletAddress = AccountId.fromString(signingAccount).toSolidityAddress();
      const tokenToTradeAddress = TokenId.fromString(tokenToTradeAccountId).toSolidityAddress();
      const tokenToTradeAmount = wallet.getTokenAmountWithPrecision(
        tokenToTrade.tokenMeta.tokenId ?? "",
        tokenToTrade.amount ?? ""
      );
      const provider = WalletService.getProvider(
        context.network,
        wallet.topicID,
        wallet.savedPairingData?.accountIds[0] ?? ""
      );
      const signer = WalletService.getSigner(provider);
      try {
        // Sometimes (on first run throught it seems) the AcknowledgeMessageEvent from hashpack does not fire
        // so we need to manually dispatch the action here indicating that transaction is waiting to be signed
        set(
          ({ swap }) => {
            swap.transactionState.transactionWaitingToBeSigned = true;
          },
          false,
          SwapActionType.SIGN_SWAP_TRANSACTION_STARTED
        );
        const result = await HederaService.swapToken({
          contractId,
          walletAddress,
          tokenToTradeAddress,
          tokenToTradeAmount,
          signer,
        });
        set(
          ({ swap }) => {
            swap.transactionState.transactionWaitingToBeSigned = false;
          },
          false,
          SwapActionType.SIGN_SWAP_TRANSACTION_SUCCEEDED
        );
        if (result) {
          set(
            ({ swap }) => {
              swap.transactionState.successPayload = result;
            },
            false,
            SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED
          );
        } else {
          throw new Error("Transaction Execution Failed");
        }
        /* TODO: Results will be saved in context state and displayed in the UI */
        console.log(result);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set(
          ({ swap }) => {
            swap.transactionState.errorMessage = errorMessage;
          },
          false,
          SwapActionType.SEND_SWAP_TRANSACTION_TO_WALLET_FAILED
        );
      }
      app.setFeaturesAsLoaded(["transactionState"]);
    },
  };
};

export { createSwapSlice };
