import { ChakraProvider, Container } from "@chakra-ui/react";
import { Trade, Pool, Pools } from "./pages";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { HederaOpenDexTheme } from "./styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const menuOptions = ["Swap", "Pool"];

// TODO: remove mocks
const mockPoolsProps = {
  allPoolsColHeaders: [
    { headerName: "name", colWidth: 158 },
    { headerName: "fee", colWidth: 61 },
    { headerName: "totalVolumeLocked", colWidth: 136 },
    { headerName: "past24HoursVolume", colWidth: 136 },
    { headerName: "past7daysVolume", colWidth: 136 },
    { headerName: "Actions", colWidth: 203 },
  ],
  allPools: [],
  userPoolsColHeaders: [
    { headerName: "Pool", colWidth: 158 },
    { headerName: "Fee", colWidth: 61 },
    { headerName: "Liquidity", colWidth: 136 },
    { headerName: "% of the Pool", colWidth: 118 },
    { headerName: "Unclaimed Fees", colWidth: 131 },
    { headerName: "Actions", colWidth: 226 },
  ],
  userPools: [
    {
      Pool: "HBAR/USDT",
      Fee: "0.05%",
      Liquidity: "$123,456",
      "% of the Pool": "<1%",
      "Unclaimed Fees": "$4.56",
    },
    {
      Pool: "HBAR/USDT",
      Fee: "0.05%",
      Liquidity: "$123,456",
      "% of the Pool": "<1%",
      "Unclaimed Fees": "$91.23",
    },
    {
      Pool: "HBAR/USDT",
      Fee: "0.05%",
      Liquidity: "$123,456",
      "% of the Pool": "100%",
      "Unclaimed Fees": "$0.89",
    },
  ],
};

const HederaOpenDEX = () => {
  return (
    <ChakraProvider theme={HederaOpenDexTheme}>
      <Container color="black" w="100%" minHeight="1600px" maxHeight="100%" maxWidth="100%" bg="#F5F5F5" centerContent>
        <Router>
          <TopMenuBar menuOptions={menuOptions}></TopMenuBar>
          <Routes>
            <Route path="/" element={<Navigate to="/swap" />} />
            <Route path="/swap" element={<Trade />} />
            <Route path="/pool" element={<Pools />} />
            <Route path="/pool/add-liquidity" element={<Pool />} />
          </Routes>
        </Router>
      </Container>
    </ChakraProvider>
  );
};

export { HederaOpenDEX };
