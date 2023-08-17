import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { Color, TextStyles } from "../../themes";

export enum TagVariant {
  Active = "active",
  Queued = "queued",
  Succeeded = "succeeded",
  Failed = "failed",
  Primary = "primary",
  Secondary = "secondary",
}

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const baseTagStyles = {
  container: { minWidth: "fit-content", borderRadius: "4px", padding: "6px 12px", gap: 1 },
  label: { ...TextStyles["p small semibold"] },
};

const active = definePartsStyle({
  container: {
    ...baseTagStyles.container,
    ...baseTagStyles.label,
    color: Color.Blue._500,
    bg: Color.Blue._50,
  },
});

const queued = definePartsStyle({
  container: {
    ...baseTagStyles.container,
    ...baseTagStyles.label,
    color: Color.Warning._600,
    bg: Color.Warning._50,
  },
});

const succeeded = definePartsStyle({
  container: {
    ...baseTagStyles.container,
    ...baseTagStyles.label,
    color: Color.Success._700,
    bg: Color.Success._50,
  },
});

const failed = definePartsStyle({
  container: {
    ...baseTagStyles.container,
    ...baseTagStyles.label,
    color: Color.Destructive._600,
    bg: Color.Destructive._50,
  },
});

const primary = {
  container: {
    ...baseTagStyles.container,
    ...baseTagStyles.label,
    color: Color.Grey_Blue._600,
    bg: Color.Grey_Blue._100,
  },
};

const secondary = {
  container: {
    ...baseTagStyles.container,
    ...baseTagStyles.label,
    color: Color.Grey_Blue._400,
    bg: Color.Grey_Blue._50,
  },
};

export const TagStyles = defineMultiStyleConfig({
  variants: {
    primary,
    secondary,
    active,
    queued,
    succeeded,
    failed,
  },
  defaultProps: {
    variant: "primary",
  },
});
