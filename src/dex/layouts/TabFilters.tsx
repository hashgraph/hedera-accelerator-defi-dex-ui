import { Tab, TabList } from "@chakra-ui/react";
import { Color } from "../../shared/ui-kit";

export interface TabFilter<T> {
  name: string;
  filters?: T[];
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
            padding="0.75rem 1.25rem"
            textStyle="p medium medium"
            color={Color.Neutral._400}
            _selected={{ color: Color.Neutral._900, borderBottom: `4px solid ${Color.Primary._500}` }}
          >
            {filter.name}
          </Tab>
        );
      })}
    </TabList>
  );
}
