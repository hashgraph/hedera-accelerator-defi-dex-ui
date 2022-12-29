import { Tab, TabList } from "@chakra-ui/react";
import { Color } from "../../dex-ui-components";

export interface TabFilter<T> {
  name: string;
  filters: T[];
}

/**
 * TODO: Move styles to component library.
 */

interface TabFiltersProps<T> {
  filters: TabFilter<T>[];
}

export function TabFilters<T>(props: TabFiltersProps<T>) {
  return (
    <TabList borderBottom="0">
      {props.filters.map((filter: TabFilter<T>, index: number) => {
        return (
          <Tab
            key={index}
            id={filter.name}
            height="fit-content"
            padding="0"
            marginRight="1.5rem"
            textStyle="h3"
            color={Color.Grey_02}
            _selected={{ color: Color.Black_01, borderBottom: `4px solid ${Color.Black_01}` }}
          >
            {filter.name}
          </Tab>
        );
      })}
    </TabList>
  );
}
