import { IconButton, Tooltip } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useThemeMode } from "../../themes";

export function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useThemeMode();

  return (
    <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"} placement="bottom">
      <IconButton
        aria-label="Toggle theme"
        icon={isDark ? <SunIcon /> : <MoonIcon />}
        onClick={toggleTheme}
        variant="ghost"
        size="md"
        color={theme.textSecondary}
        _hover={{
          bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          color: theme.text,
        }}
        transition="all 0.2s"
      />
    </Tooltip>
  );
}
