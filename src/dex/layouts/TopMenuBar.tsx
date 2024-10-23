import { NavLink } from "react-router-dom";
import { Box, Flex, Menu, MenuItem, Alert, Text } from "@chakra-ui/react";
import { useDexContext } from "@dex/hooks";
import { Color, HashDaoLogo, WalletConnection } from "@shared/ui-kit";
import { isMobile } from "react-device-detect";
import { useEffect, useState } from "react";

export interface TopMenuBarProps {
  menuOptions: Array<string>;
}

export function TopMenuBar(props: TopMenuBarProps): JSX.Element {
  const { app, wallet } = useDexContext(({ app, context, wallet }) => ({ app, context, wallet }));
  const [reconnectionInProgress, setReconnectionInProgress] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("reconnectionInProgress")) {
      setReconnectionInProgress(true);

      setTimeout(() => {
        localStorage.removeItem("reconnectionInProgress");
        setReconnectionInProgress(false);
      }, 10000);
    }
  }, []);

  return (
    <Flex as="header" layerStyle="navbar">
      <Menu>
        <Flex direction="row" gap="4">
          <Flex direction="row" gap="2" alignItems="center">
            {/* <HashDaoIcon boxSize="10" />
            <Tag label="HashDAO" />*/}
            <HashDaoLogo width="60%" height="100%" />
          </Flex>
          <Alert variant="">
            {reconnectionInProgress && (
              <Text fontSize={13} fontStyle="italic">
                Network switching detected. If you {"don't"} have any accounts in selected network since we unable check
                it, you can back to previous one.
              </Text>
            )}
          </Alert>
          <Flex direction="row" gap="1">
            {props.menuOptions.map((menuOption, index) => {
              return (
                <Box width="fit-content" key={index}>
                  <NavLink key={menuOption} to={`${menuOption.toLowerCase()}`}>
                    <MenuItem justifyContent="center" borderRadius="4px" _hover={{ bg: Color.Neutral._100 }}>
                      <Text.P_Medium_Medium>{menuOption}</Text.P_Medium_Medium>
                    </MenuItem>
                  </NavLink>
                </Box>
              );
            })}
          </Flex>
        </Flex>
        {isMobile && (
          <Box textAlign="right" float="right" borderRadius="8px" width="fit-content">
            Desktop only
          </Box>
        )}
        {!isMobile && (
          <Box textAlign="right" float="right" borderRadius="8px" width="fit-content">
            <WalletConnection
              accountId={wallet.savedPairingData?.accountIds[0] ?? ""}
              connectionState={wallet.hashConnectConnectionState}
              accountBalances={wallet.pairedAccountBalance}
              isLoading={app.isFeatureLoading("pairedAccountBalance")}
              connectToWallet={wallet.connectToWallet}
              disconnectFromWallet={wallet.disconnectWallet}
            />
          </Box>
        )}
      </Menu>
    </Flex>
  );
}
