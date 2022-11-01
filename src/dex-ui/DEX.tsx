import { ChakraProvider, Container } from "@chakra-ui/react";
import { Swap, AddLiquidity, Pools, Withdraw, Governance } from "./pages";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { DEXTheme } from "./styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useWalletConnection } from "./hooks";

const menuOptions = ["Swap", "Pools", "Governance"];

const DEX = () => {
  useWalletConnection();
  return (
    <ChakraProvider theme={DEXTheme}>
      <Container color="black" w="100%" minHeight="1600px" maxHeight="100%" maxWidth="100%" bg="#FFFFFF" centerContent>
        <Router>
          <TopMenuBar menuOptions={menuOptions}></TopMenuBar>
          <Routes>
            <Route path="/" element={<Navigate to="/swap" />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/pools" element={<Pools />} />
            <Route path="/pools/add-liquidity" element={<AddLiquidity />} />
            <Route path="/pools/withdraw" element={<Withdraw />} />
            <Route path="/governance" element={<Governance />} />
          </Routes>
        </Router>
      </Container>
    </ChakraProvider>
  );
};

export { DEX };
