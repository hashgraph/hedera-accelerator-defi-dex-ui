import { ChakraProvider, Container } from "@chakra-ui/react";
import { Trade, Pool, Pools, Withdraw } from "./pages";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { DEXTheme } from "./styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useWalletConnection } from "./hooks";

const menuOptions = ["Swap", "Pool"];

const DEX = () => {
  useWalletConnection();
  return (
    <ChakraProvider theme={DEXTheme}>
      <Container color="black" w="100%" minHeight="1600px" maxHeight="100%" maxWidth="100%" bg="#F5F5F5" centerContent>
        <Router>
          <TopMenuBar menuOptions={menuOptions}></TopMenuBar>
          <Routes>
            <Route path="/" element={<Navigate to="/swap" />} />
            <Route path="/swap" element={<Trade />} />
            <Route path="/pool" element={<Pools />} />
            <Route path="/pool/add-liquidity" element={<Pool />} />
            <Route path="/pool/withdraw" element={<Withdraw />} />
          </Routes>
        </Router>
      </Container>
    </ChakraProvider>
  );
};

export { DEX };
