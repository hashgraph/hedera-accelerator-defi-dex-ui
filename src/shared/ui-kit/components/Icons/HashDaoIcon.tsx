import { createIcon } from "@chakra-ui/react";

export const HashDaoIcon = createIcon({
  displayName: "HashioDaoIcon",
  viewBox: "0 0 100 100",
  path: (
    <>
      {/* Blue circle background */}
      <circle cx="50" cy="50" r="50" fill="#5B8EC2" />
      {/* Hashtag symbol - white */}
      {/* Vertical bars */}
      <rect x="32" y="22" width="8" height="56" rx="2" fill="white" />
      <rect x="60" y="22" width="8" height="56" rx="2" fill="white" />
      {/* Horizontal bars */}
      <rect x="22" y="34" width="56" height="8" rx="2" fill="white" />
      <rect x="22" y="58" width="56" height="8" rx="2" fill="white" />
    </>
  ),
});
