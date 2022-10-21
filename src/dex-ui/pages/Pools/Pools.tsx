import { Button, Container, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { DataTable, DataTableColumnConfig } from "../../../dex-ui-components/base/DataTable";
// import { PoolState, UserPoolState } from "../../services";
import { formatPoolMetrics, formatUserPoolMetrics } from "./utils";
import { isEmpty } from "ramda";
import { useDexContext } from "../../hooks";
import { PoolState, UserPoolState } from "../../store/poolsSlice";

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
  const [wallet, pools] = useDexContext(({ wallet, pools }) => [wallet, pools]);
  const walletAccountId = wallet.walletData.pairedAccounts[0];

  const [colHeadersState, setState] = useState({ allPoolsColHeaders, userPoolsColHeaders });

  useEffect(() => {
    const fetchPoolMetrics = async () => {
      await pools.fetchAllPoolMetrics();
      await pools.fetchUserPoolMetrics(walletAccountId);
    };
    fetchPoolMetrics();
  }, [walletAccountId]);

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

  const formatPoolsRowData = (
    rowData: PoolState[] | UserPoolState[] | FormattedPoolDetails[] | FormattedUserPoolDetails[] | undefined,
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
                  to={userPool ? `/pool/withdraw?pool=${row.name.replace("/", "-")}` : "/swap"}
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

  return (
    <Tabs display={"flex"} flexDirection={"column"}>
      <TabList display={"flex"} justifyContent={"space-between"} alignItems={"center"} padding={"0"} margin={"0 16px"}>
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
          <DataTable colHeaders={colHeadersState.allPoolsColHeaders} rowData={getAllPoolsRowData()} />
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
          <DataTable colHeaders={colHeadersState.userPoolsColHeaders} rowData={getUserPoolsRowData()} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export { Pools };
