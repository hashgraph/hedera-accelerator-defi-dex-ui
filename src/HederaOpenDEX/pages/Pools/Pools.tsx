import { Button, Container, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { DataTable, DataTableColumnConfig } from "../../../components/base/DataTable";

export interface BasePoolDetails {
  Pool: string; // TODO: type this (will need token symbol filename and potentially other details)
  Fee: string;
}

export interface UserPoolDetails extends BasePoolDetails {
  Liquidity: string;
  "% of the Pool": string;
  "Unclaimed Fees"?: string;
}

export interface PoolDetails extends BasePoolDetails {
  TVL: string;
  "Volume 24H": string;
  "Volume 7D": string;
}

export interface PoolsProps {
  allPools: PoolDetails[] | undefined;
  allPoolsColHeaders: DataTableColumnConfig[];
  userPools: UserPoolDetails[] | undefined;
  userPoolsColHeaders: DataTableColumnConfig[];
}

const Pools = (props: PoolsProps): JSX.Element => {
  const [state, setState] = useState(props);

  // Scales column width differences
  // TODO: check if we will need this, should be up to consumer of component to send proper values
  useEffect(() => {
    const allPoolsTotalColWidth = state.allPoolsColHeaders.reduce((total, col) => (total += col.colWidth), 0);
    const userPoolsTotalColWidth = state.userPoolsColHeaders.reduce((total, col) => (total += col.colWidth), 0);
    if (allPoolsTotalColWidth > userPoolsTotalColWidth) {
      setState({
        ...state,
        userPoolsColHeaders: scaleColWidth(state.userPoolsColHeaders, userPoolsTotalColWidth, allPoolsTotalColWidth),
      });
    } else if (userPoolsTotalColWidth > allPoolsTotalColWidth) {
      setState({
        ...state,
        allPoolsColHeaders: scaleColWidth(state.allPoolsColHeaders, allPoolsTotalColWidth, userPoolsTotalColWidth),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scaleColWidth = (colConfig: DataTableColumnConfig[], currentTotalWidth: number, targetTotalWidth: number) =>
    colConfig.map((col) => ({ ...col, colWidth: (col.colWidth / currentTotalWidth) * targetTotalWidth }));

  const unclaimedFeeTotal = useCallback(() => {
    const totalUnclaimedFees = state.userPools?.reduce(
      (unclaimedFeeTotal, pool) => (unclaimedFeeTotal += +(pool["Unclaimed Fees"]?.substring(1) || 0)),
      0
    );
    return totalUnclaimedFees || 0;
  }, [state]);

  const getAllPoolsRowData = useCallback(() => formatPoolsRowData(state.allPools), [state]);

  const getUserPoolsRowData = useCallback(() => formatPoolsRowData(state.userPools, true), [state]);

  const formatPoolsRowData = (rowData: PoolDetails[] | UserPoolDetails[] | undefined, userPool = false) => {
    return rowData
      ? [
          ...rowData.map((row) => ({
            ...row,
            // TODO: links should bring user to corresponding page for the specific pair
            // do we want to make Actions something optional (pass in whether to show it as a prop)?
            Actions: (
              <>
                <Link
                  textDecoration={"underline"}
                  color={"#3078FF"}
                  mr={"1em"}
                  as={RouterLink}
                  to={userPool ? "/pool/this-doesnt-exist-yet" : "/swap"}
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
          {state.allPools ? (
            <Tab fontSize={"32px"} padding={"0 0 8px 0"} marginRight={"32px"}>
              Pools
            </Tab>
          ) : (
            ""
          )}
          {state.userPools ? (
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
          <DataTable colHeaders={state.allPoolsColHeaders} rowData={getAllPoolsRowData()} />
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
                  Total unclaimed fees across {state.userPools?.length} pools:&nbsp;
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
          <DataTable colHeaders={state.userPoolsColHeaders} rowData={getUserPoolsRowData()} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export { Pools };
