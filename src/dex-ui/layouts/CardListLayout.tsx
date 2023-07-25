import { Flex, Spacer, Tabs, TabPanels, TabPanel } from "@chakra-ui/react";
import { ReactNode } from "react";

interface CardListLayoutProps {
  onTabChange?: (index: number) => void;
  tabFilters?: ReactNode;
  inputFilters?: ReactNode;
  cardLists?: ReactNode[];
  cardListLayerStyles?: string;
  paginationComponent?: ReactNode;
}

export function CardListLayout(props: CardListLayoutProps) {
  return (
    <Flex direction="column" gap={8} minWidth="100%">
      <Tabs onChange={props.onTabChange} flex="1" isLazy>
        <Flex flex="row">
          {props.tabFilters}
          <Spacer />
          <Flex flex="row">{props.inputFilters}</Flex>
        </Flex>
        <TabPanels>
          {props.cardLists?.map((cardList: ReactNode, index: number) => (
            <TabPanel key={index} layerStyle={props.cardListLayerStyles}>
              <Flex direction="column" gap="2" minHeight="100%">
                {cardList}
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <Flex alignSelf="end" width="fit-content">
        {props.paginationComponent}
      </Flex>
    </Flex>
  );
}
