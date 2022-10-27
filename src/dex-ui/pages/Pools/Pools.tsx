import {
  Button,
  Container,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Link,
  Text,
  Tag,
  TagCloseButton,
  Skeleton,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { DataTable, DataTableColumnConfig } from "../../../dex-ui-components/base/DataTable";
import { formatPoolMetrics, formatUserPoolMetrics } from "./formatters";
import { isEmpty } from "ramda";
import { useDexContext } from "../../hooks";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Pool, UserPool } from "../../store/poolsSlice";

export interface FormattedUserPoolDetails {
  name: string;
  fee: string;
  liquidity: string;
  percentOfPool: string;
  unclaimedFees: string;
  actions?: JSX.Element;
}

export interface FormattedPoolDetails {
  name: string;
  fee: string;
  totalVolumeLocked: string;
  past24HoursVolume: string;
  past7daysVolume: string;
  actions?: JSX.Element;
}

const allPoolsColHeaders: DataTableColumnConfig[] = [
  { headerName: "Pool", field: "name", colWidth: 158 },
  { headerName: "Fee", field: "fee", colWidth: 61 },
  { headerName: "TVL", field: "totalVolumeLocked", colWidth: 136 },
  { headerName: "Volume 24H", field: "past24HoursVolume", colWidth: 136 },
  { headerName: "Volume 7D", field: "past7daysVolume", colWidth: 136 },
  { headerName: "Actions", field: "actions", colWidth: 203 },
];

const userPoolsColHeaders: DataTableColumnConfig[] = [
  { headerName: "Pool", field: "name", colWidth: 158 },
  { headerName: "Fee", field: "fee", colWidth: 61 },
  { headerName: "Liquidity", field: "liquidity", colWidth: 136 },
  { headerName: "% of the Pool", field: "percentOfPool", colWidth: 118 },
  { headerName: "Unclaimed Fees", field: "unclaimedFees", colWidth: 131 },
  { headerName: "Actions", field: "actions", colWidth: 226 },
];

const Pools = (): JSX.Element => {
  const { app, wallet, pools } = useDexContext(({ app, wallet, pools }) => ({ app, wallet, pools }));
  const walletAccountId = wallet.walletData.pairedAccounts[0];
  const { fetchAllPoolMetrics, fetchUserPoolMetrics } = pools;
  const [colHeadersState, setState] = useState({ allPoolsColHeaders, userPoolsColHeaders });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [queryParamState, setQueryParamState] = useState({
    selectedTab: 0,
    showSuccessfulWithdrawalMessage: false,
  });

  const fetchPoolDataOnLoad = useCallback(async () => {
    await fetchAllPoolMetrics();
    await fetchUserPoolMetrics(walletAccountId);
  }, [fetchAllPoolMetrics, fetchUserPoolMetrics, walletAccountId]);

  useEffect(() => {
    fetchPoolDataOnLoad();
  }, [fetchPoolDataOnLoad, walletAccountId]);

  // Scales column width differences
  // TODO: check if we will need this, should be up to consumer of component to send proper values
  useEffect(() => {
    const allPoolsTotalColWidth = colHeadersState.allPoolsColHeaders.reduce((total, col) => (total += col.colWidth), 0);
    const userPoolsTotalColWidth = colHeadersState.userPoolsColHeaders.reduce(
      (total, col) => (total += col.colWidth),
      0
    );
    if (allPoolsTotalColWidth > userPoolsTotalColWidth) {
      setState({
        ...colHeadersState,
        userPoolsColHeaders: scaleColWidth(
          colHeadersState.userPoolsColHeaders,
          userPoolsTotalColWidth,
          allPoolsTotalColWidth
        ),
      });
    } else if (userPoolsTotalColWidth > allPoolsTotalColWidth) {
      setState({
        ...colHeadersState,
        allPoolsColHeaders: scaleColWidth(
          colHeadersState.allPoolsColHeaders,
          allPoolsTotalColWidth,
          userPoolsTotalColWidth
        ),
      });
    }

    /**
     * OnInit
     * -if query param indicates which set of pools to display, jump to that tab
     * -if coming from a successful withdrawal, display success message with withdraw details
     *    -NOTE: in the successful withdrawal case, since user is navigating from withdrawal
     *           page, the pools data will have been fetched already
     */
    const selectedPools = searchParams.get("selectedPools");
    const withdrawSuccessful = searchParams.get("withdrawSuccessful");
    if (selectedPools === "user") {
      // My Pools is the second tab, so set selectedTab index to 1
      setQueryParamState((queryParamState) => ({ ...queryParamState, selectedTab: 1 }));
    }
    if (withdrawSuccessful === "true") {
      setQueryParamState((queryParamState) => ({ ...queryParamState, showSuccessfulWithdrawalMessage: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scaleColWidth = (colConfig: DataTableColumnConfig[], currentTotalWidth: number, targetTotalWidth: number) =>
    colConfig.map((col) => ({ ...col, colWidth: (col.colWidth / currentTotalWidth) * targetTotalWidth }));

  const unclaimedFeeTotal = useCallback(() => {
    const totalUnclaimedFees = pools.userPoolsMetrics?.reduce(
      (unclaimedFeeTotal: any, pool: any) => (unclaimedFeeTotal += +(pool.unclaimedFees || 0)),
      0
    );
    return totalUnclaimedFees || 0;
  }, [pools.userPoolsMetrics]);

  const getAllPoolsRowData = useCallback(
    () => formatPoolsRowData(pools.allPoolsMetrics.map(formatPoolMetrics)),
    [pools.allPoolsMetrics]
  );

  const getUserPoolsRowData = useCallback(
    () => formatPoolsRowData(pools.userPoolsMetrics.map(formatUserPoolMetrics), true),
    [pools.userPoolsMetrics]
  );

  /**
   * Navigates to the corresponding URL for the links in Actions column. Deferring
   * to a method to handle this instead of directly using the "to" prop in the Link
   * component from chakra ui because in the case of navigating to the withdraw component,
   * we need to reset the pool state variables for the withdrawal state. Without resetting
   * the withdraw state variables in pool store, after successful withdrawals the withdraw
   * component will navigate back to the pools page as there is an effect in Withdraw page
   * that listens to whether withdrawal transaction was successful and navigates back to Pools
   * page if field is successful. Therefore without resetting that field it causes a redirect back
   * @param action - withdraw or swap action link
   * @param pool - pool to withdraw from in the case of withdraw action link
   */
  const actionNavigation = async (action: "withdraw" | "swap", pool?: string) => {
    if (action === "withdraw") {
      await pools.resetWithdrawState();
      navigate(`/pool/withdraw?pool=${(pool || "").replace("/", "-")}`);
    } else {
      navigate("/swap");
    }
  };

  const formatPoolsRowData = (
    rowData: Pool[] | UserPool[] | FormattedPoolDetails[] | FormattedUserPoolDetails[] | undefined,
    userPool = false
  ) => {
    return rowData
      ? [
          ...rowData.map((row) => ({
            ...row,
            // TODO: links should bring user to corresponding page for the specific pair
            // do we want to make Actions something optional (pass in whether to show it as a prop)?
            actions: (
              <>
                <Link
                  textDecoration={"underline"}
                  color={"#3078FF"}
                  mr={"1em"}
                  as={RouterLink}
                  to={userPool ? "/pool" : "/swap"}
                  onClick={userPool ? () => actionNavigation("withdraw", row.name) : () => actionNavigation("swap")}
                >
                  {userPool ? "Withdraw" : "Swap"}
                </Link>
                <Link textDecoration={"underline"} color={"#3078FF"} as={RouterLink} to={"/pool/add-liquidity"}>
                  Add Liquidity
                </Link>
              </>
            ),
          })),
        ]
      : [];
  };

  const getHashScanLink = useCallback(() => {
    const transactionId = pools.withdrawState.successPayload?.transactionResponse.transactionId.toString();
    const urlFormattedTimestamp = transactionId?.split("@")[1].replace(".", "-");
    const formattedTransactionId = `${transactionId?.split("@")[0]}-${urlFormattedTimestamp}`;
    // format: https://hashscan.io/#/testnet/transaction/0.0.34744739-1665448985-817445871
    // TODO: set testnet/mainnet based on network
    return `https://hashscan.io/#/testnet/transaction/${formattedTransactionId}`;
  }, [pools.withdrawState.successPayload]);

  return (
    <>
      <Tabs
        display={"flex"}
        flexDirection={"column"}
        index={queryParamState.selectedTab}
        onChange={(index) => setQueryParamState({ ...queryParamState, selectedTab: index })}
      >
        {pools.withdrawState.status === "success" && queryParamState.showSuccessfulWithdrawalMessage ? (
          <Tag width={"calc(100%) - 32px"} padding={"8px"} margin={"16px"} backgroundColor={"#00e64d33"}>
            <Flex width={"100%"} flexWrap={"wrap"}>
              <Text color={"#000000"}>
                {`Withdrew ${pools.withdrawState.successPayload?.lpTokenAmount} LP Tokens from 
                ${pools.withdrawState.successPayload?.lpTokenSymbol} 
                ${pools.withdrawState.successPayload?.fee} fee Pool.`}
                &nbsp;
              </Text>
              {
                // TODO: make link to HashScan its own component (also being used in Swap component)}
              }
              <Link
                width={"fit-content"}
                display={"flex"}
                alignItems={"center"}
                color={"#0180FF"}
                href={getHashScanLink()}
                isExternal
              >
                <Text textDecoration={"underline"}>View in HashScan</Text> <ExternalLinkIcon />
              </Link>
            </Flex>
            <TagCloseButton
              color={"#000000"}
              onClick={() => setQueryParamState({ ...queryParamState, showSuccessfulWithdrawalMessage: false })}
            />
          </Tag>
        ) : (
          ""
        )}
        <TabList
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          padding={"0"}
          margin={"0 16px"}
        >
          <Flex>
            {!isEmpty(pools.allPoolsMetrics) ? (
              <Tab fontSize={"32px"} padding={"0 0 8px 0"} marginRight={"32px"}>
                Pools
              </Tab>
            ) : (
              ""
            )}
            {pools.userPoolsMetrics ? (
              <Tab fontSize={"32px"} padding={"0 0 8px 0"}>
                My Pools
              </Tab>
            ) : (
              ""
            )}
          </Flex>
          <Button width={"200px"} marginBottom={"10px"}>
            Create Pool
          </Button>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Skeleton speed={0.4} fadeDuration={0} isLoaded={!app.isFeatureLoading("allPoolsMetrics")}>
              <DataTable colHeaders={colHeadersState.allPoolsColHeaders} rowData={getAllPoolsRowData()} />
            </Skeleton>
          </TabPanel>
          <TabPanel>
            {unclaimedFeeTotal() > 0 ? (
              <Container
                padding={"12px"}
                margin={"0 0 16px 0"}
                width={"100%"}
                maxWidth={"100%"}
                backgroundColor={"#D9D9D9"}
              >
                <Flex width={"100%"} justifyContent={"space-between"} alignItems={"center"} flexWrap={"wrap"}>
                  <Text>
                    Total unclaimed fees across {pools.userPoolsMetrics?.length} pools:&nbsp;
                    <span style={{ fontWeight: "bold" }}>${unclaimedFeeTotal()}</span>
                  </Text>

                  <Button size={"sm"} height={"32px"}>
                    Claim Fees
                  </Button>
                </Flex>
              </Container>
            ) : (
              ""
            )}
            <Skeleton speed={0.4} fadeDuration={0} isLoaded={!app.isFeatureLoading("userPoolsMetrics")}>
              <DataTable colHeaders={colHeadersState.userPoolsColHeaders} rowData={getUserPoolsRowData()} />
            </Skeleton>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export { Pools };
