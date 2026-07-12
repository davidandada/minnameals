"use client";

import React from "react";
import { Chip, type SxProps, type Theme } from "@mui/material";

type Props = {
  emoji: string;
  name: string;
  colorName: string;
  iconOnly?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  sx?: SxProps<Theme>;
};

export default function CategoryChip({ emoji, name, colorName, iconOnly = false, onClick, sx }: Props) {
  return (
    <Chip
      label={iconOnly ? emoji : `${emoji} ${name}`}
      size="small"
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        backgroundColor: `color-mix(in srgb, var(--mui-palette-${colorName}-500) 15%, transparent)`,
        color: `var(--mui-palette-${colorName}-200)`,
        fontWeight: "bold",
        border: `1px solid color-mix(in srgb, var(--mui-palette-${colorName}-500) 30%, transparent)`,
        height: "24px",
        ...(iconOnly && {
          width: "32px",
          minWidth: "auto",
          "& .MuiChip-label": {
            p: 0,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            lineHeight: "24px",
          },
        }),
        ...(!iconOnly && {
          "& .MuiChip-label": {
            fontSize: "0.8125rem",
            display: "flex",
            alignItems: "center",
          },
        }),
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
