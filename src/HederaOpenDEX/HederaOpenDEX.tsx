import React from "react";
import { ChakraProvider, Container } from "@chakra-ui/react";
import { Trade } from "./pages/Trade";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { HederaOpenDexTheme } from "./styles";

const menuOptions = ["Swap", "Pool", "Stake"];

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
        <TopMenuBar menuOptions={menuOptions}></TopMenuBar>
        <Trade></Trade>
      </Container>
    </ChakraProvider>
  );
};

export { HederaOpenDEX };
