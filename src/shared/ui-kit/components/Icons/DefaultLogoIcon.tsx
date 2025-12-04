import { Icon, IconProps } from "@chakra-ui/react";
import { useThemeMode } from "../../themes/ThemeContext";

export const DefaultLogoIcon = (props: IconProps) => {
  const { isDark } = useThemeMode();
  const circleColor = isDark ? "#4B5563" : "#D1D5DB";
  const hashtagColor = isDark ? "#1F2937" : "white";

  return (
    <Icon viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="50" fill={circleColor} />
      <rect x="32" y="22" width="8" height="56" rx="2" fill={hashtagColor} />
      <rect x="60" y="22" width="8" height="56" rx="2" fill={hashtagColor} />
      <rect x="22" y="34" width="56" height="8" rx="2" fill={hashtagColor} />
      <rect x="22" y="58" width="56" height="8" rx="2" fill={hashtagColor} />
    </Icon>
  );
};
