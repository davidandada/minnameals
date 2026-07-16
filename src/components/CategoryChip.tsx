"use client";

import React from "react";
import { Chip, type SxProps, type Theme } from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { type CategoryApi } from "@/types/api/category";

type Props = {
  category?: Partial<CategoryApi> | null;
  iconOnly?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  sx?: SxProps<Theme>;
};

export default function CategoryChip({ category, iconOnly = false, onClick, sx }: Props) {
  if (!category) {
    return (
      <Chip
        icon={<LocalOfferOutlinedIcon sx={{ fontSize: "12px !important", mr: "4px !important" }} />}
        label="+"
        size="small"
        onClick={onClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          backgroundColor: "transparent",
          color: "var(--mui-palette-baedaGrey-400)",
          border: "1px solid var(--mui-palette-baedaGrey-600)",
          minWidth: "auto",
          px: 0.5,
          "& .MuiChip-label": {
            pl: 0.5,
            pr: 0.5,
            fontWeight: "bold",
          },
          "&:hover": onClick
            ? {
                borderColor: "var(--mui-palette-baedaOrange-300)",
                color: "var(--mui-palette-baedaOrange-200)",
                backgroundColor: "rgba(255, 192, 107, 0.08)",
              }
            : undefined,
          ...sx,
        }}
      />
    );
  }

  const emoji = category.emoji || "";
  const name = category.name || "";
  const color = category.colour || "baedaGrey";

  return (
    <Chip
      label={iconOnly ? emoji : `${emoji} ${name}`}
      size="small"
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        backgroundColor: `color-mix(in srgb, var(--mui-palette-${color}-500) 15%, transparent)`,
        color: `var(--mui-palette-${color}-200)`,
        fontWeight: "bold",
        border: `1px solid color-mix(in srgb, var(--mui-palette-${color}-500) 30%, transparent)`,
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
              backgroundColor: `color-mix(in srgb, var(--mui-palette-${color}-500) 25%, transparent)`,
            }
          : undefined,
        ...sx,
      }}
    />
  );
}
