import { ChakraProvider, Container, Flex } from "@chakra-ui/react";
import { Swap, AddLiquidity, Pools, Withdraw, Governance, CreateProposal, SelectProposalType } from "./pages";
import { TopMenuBar } from "./layouts/TopMenuBar";
import { DEXTheme } from "./styles";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useWalletConnection } from "./hooks";
import { ScrollToTop } from "./utils";

const menuOptions = ["Swap", "Pools", "Governance"];

const DEX = () => {
  useWalletConnection();
  return (
    <ChakraProvider theme={DEXTheme}>
      <Container color="black" w="100%" maxHeight="100%" maxWidth="100%" bg="#FFFFFF" marginBottom="5rem" centerContent>
        <Router>
          <ScrollToTop>
            <TopMenuBar menuOptions={menuOptions}></TopMenuBar>
            <Flex width="66rem" justifyContent="center">
              <Routes>
                <Route path="/" element={<Navigate to="/swap" />} />
                <Route path="/swap" element={<Swap />} />
                <Route path="/pools" element={<Pools />} />
                <Route path="/pools/add-liquidity" element={<AddLiquidity />} />
                <Route path="/pools/withdraw" element={<Withdraw />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/governance/select-proposal-type" element={<SelectProposalType />} />
                {/* eslint-disable max-len */}
                <Route path="/governance/select-proposal-type/new-token" element={<CreateProposal proposalType="new-token" />} />
                <Route path="/governance/select-proposal-type/text" element={<CreateProposal proposalType="text" />} />
                <Route path="/governance/select-proposal-type/token-transfer" element={<CreateProposal proposalType="token-transfer" />} />
                <Route path="/governance/select-proposal-type/contract-upgrade" element={<CreateProposal proposalType="contract-upgrade" />} />
                {/* eslint-enable max-len */}
              </Routes>
            </Flex>
          </ScrollToTop>
        </Router>
      </Container>
    </ChakraProvider>
  );
};

export { DEX };
