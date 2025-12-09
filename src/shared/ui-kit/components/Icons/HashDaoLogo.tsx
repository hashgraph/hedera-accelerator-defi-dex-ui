import { createIcon } from "@chakra-ui/react";

export const HashDaoLogo = createIcon({
  displayName: "HashioDaoLogo",
  viewBox: "0 0 400 100",
  path: (
    <>
      {/* Blue circle background */}
      <circle cx="50" cy="50" r="45" fill="#4A90D9" />
      {/* Hashtag symbol - white */}
      {/* Vertical bars */}
      <rect x="35" y="20" width="7" height="60" rx="2" fill="white" />
      <rect x="58" y="20" width="7" height="60" rx="2" fill="white" />
      {/* Horizontal bars */}
      <rect x="25" y="35" width="50" height="7" rx="2" fill="white" />
      <rect x="25" y="58" width="50" height="7" rx="2" fill="white" />

      {/* HashioDAO text */}
      <text x="115" y="62" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="bold" fill="currentColor">
        HashioDAO
      </text>
    </>
  ),
});
