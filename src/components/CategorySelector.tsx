"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { getCategories, createCategory } from "@/api/categories";
import CategoryChip from "@/components/CategoryChip";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import { useNotification } from "@/components/NotificationProvider";
import { splitCategoryName, formatCategoryName } from "@/helpers/categoryUtils";
import { type ListItemApi } from "@/types/api/listItems";

type Props = {
  item: ListItemApi;
  onSelectCategory: (categoryId: number | null) => void;
  disabled?: boolean;
};

export default function CategorySelector({ item, onSelectCategory, disabled }: Props) {
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCat) => {
      showSuccess(`Category "${newCat.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSelectCategory(newCat.id);
      handleCreateDialogClose();
    },
    onError: (err: any) => {
      showError(err.message || "Error creating category");
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSelectCategory = (categoryId: number | null) => {
    onSelectCategory(categoryId);
    handleMenuClose();
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
    handleMenuClose();
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCreateCategorySubmit = (emoji: string, color: string, name: string) => {
    const formattedName = formatCategoryName(emoji, color, name);
    createCategoryMutation.mutate({ name: formattedName });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mx: 1.5,
          flexShrink: 0,
        }}
      >
        <Skeleton
          variant="rounded"
          width={52}
          height={24}
          sx={{
            borderRadius: "16px",
            backgroundColor: "rgba(255, 192, 107, 0.08)",
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "flex",
        alignItems: "center",
        mx: 1.5,
        flexShrink: 0,
      }}
    >
      {item.category ? (
        (() => {
          const { emoji, color: catColor, name: catName } = splitCategoryName(item.category.name);
          return (
            <CategoryChip
              emoji={emoji}
              name={catName}
              colorName={catColor}
              onClick={disabled ? undefined : handleMenuOpen}
              sx={{
                ...(disabled && { pointerEvents: "none", opacity: 0.6 }),
              }}
            />
          );
        })()
      ) : (
        <Chip
          icon={<LocalOfferOutlinedIcon sx={{ fontSize: "12px !important", mr: "4px !important" }} />}
          label="+"
          size="small"
          onClick={disabled ? undefined : handleMenuOpen}
          sx={{
            cursor: disabled ? "default" : "pointer",
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
            "&:hover": {
              borderColor: "var(--mui-palette-baedaOrange-300)",
              color: "var(--mui-palette-baedaOrange-200)",
              backgroundColor: "rgba(255, 192, 107, 0.08)",
            },
            ...(disabled && { pointerEvents: "none", opacity: 0.6 }),
          }}
        />
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--mui-palette-baedaGrey-900)",
              border: "1px solid var(--mui-palette-baedaGrey-700)",
            },
          },
        }}
      >
        {item.category_id && (
          <MenuItem onClick={() => handleSelectCategory(null)}>
            <Typography variant="body2" color="error">
              Unassigned
            </Typography>
          </MenuItem>
        )}
        {categories.map((cat) => {
          const { emoji, name: catName } = splitCategoryName(cat.name);
          return (
            <MenuItem
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              selected={item.category_id === cat.id}
            >
              <Typography variant="body2">
                {emoji} {catName}
              </Typography>
            </MenuItem>
          );
        })}
        {categories.length > 0 && <Divider sx={{ my: 0.5 }} />}
        <MenuItem onClick={handleOpenCreateDialog} sx={{ color: "var(--mui-palette-baedaPink-500)" }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            + New
          </Typography>
        </MenuItem>
      </Menu>

      <CreateCategoryModal
        open={isCreateDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleCreateCategorySubmit}
        isPending={createCategoryMutation.isPending}
      />
    </Box>
  );
}
