import React from "react";
import { ChakraProvider, Container } from "@chakra-ui/react";
import { Trade, Pool, Pools } from "./pages";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { HederaOpenDexTheme } from "./styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const menuOptions = ["Swap", "Pool"];

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
