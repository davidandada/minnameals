"use client";

import React from "react";
import { Chip, type SxProps, type Theme } from "@mui/material";

type Props = {
  emoji: string;
  name: string;
  colorName: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  sx?: SxProps<Theme>;
};

export default function CategoryChip({ emoji, name, colorName, onClick, sx }: Props) {
  return (
    <Chip
      label={`${emoji} ${name}`}
      size="small"
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        backgroundColor: `color-mix(in srgb, var(--mui-palette-${colorName}-500) 15%, transparent)`,
        color: `var(--mui-palette-${colorName}-200)`,
        fontWeight: "bold",
        border: `1px solid color-mix(in srgb, var(--mui-palette-${colorName}-500) 30%, transparent)`,
        "&:hover": onClick
          ? {
              backgroundColor: `color-mix(in srgb, var(--mui-palette-${colorName}-500) 25%, transparent)`,
            }
          : undefined,
        ...sx,
      }}
    />
  );
}
