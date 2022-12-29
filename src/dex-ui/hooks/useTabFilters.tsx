import { useState } from "react";

export function useTabFilters(initialIndex = 0) {
  const [tabIndex, setTabIndex] = useState(initialIndex);

  function handleTabChange(index: number) {
    setTabIndex(index);
  }

  return {
    tabIndex,
    handleTabChange,
  };
}
