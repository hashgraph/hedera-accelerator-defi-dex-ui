import React from "react";
import { ChakraProvider, Container } from "@chakra-ui/react";
import { Trade, Pool } from "./pages";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { HederaOpenDexTheme } from "./styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const menuOptions = ["Swap", "Pool"];

const HederaOpenDEX = () => {
  return (
    <ChakraProvider theme={HederaOpenDexTheme}>
      <Container
        color="white"
        w="100%"
        minHeight="1600px"
        maxHeight="100%"
        maxWidth="100%"
        bg="rgb(20, 22, 59)"
        centerContent
      >
        <Router>
          <TopMenuBar menuOptions={menuOptions}></TopMenuBar>
          <Routes>
            <Route path="/" element={<Navigate to="/swap" />} />
            <Route path="/swap" element={<Trade />} />
            <Route path="/pool" element={<Pool />} />
          </Routes>
        </Router>
      </Container>
    </ChakraProvider>
  );
};

export { HederaOpenDEX };
