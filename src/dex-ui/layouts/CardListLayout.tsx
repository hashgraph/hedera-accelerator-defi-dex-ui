import { Flex, Spacer, Tabs, TabPanels, TabPanel } from "@chakra-ui/react";
import { ReactNode } from "react";

interface CardListLayoutProps {
  onTabChange?: (index: number) => void;
  tabFilters?: ReactNode;
  inputFilters?: ReactNode;
  cardLists?: ReactNode[];
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
          {props.cardLists?.map((cardList: ReactNode) => (
            <TabPanel padding="1rem 0 0 0">
              <Flex direction="column" gap="2" minHeight="500px">
                {cardList}
              </Flex>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      {/* TODO: Add Pagination */}
    </Flex>
  );
}
