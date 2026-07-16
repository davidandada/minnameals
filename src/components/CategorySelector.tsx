"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from "@mui/material";
import { createCategory } from "@/api/categories";
import CategoryChip from "@/components/CategoryChip";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import { useNotification } from "@/components/NotificationProvider";
import { useCategories, getCategoryById } from "@/helpers/categoryUtils";
import { type ListItemApi } from "@/types/api/listItems";

type Props = {
  item: ListItemApi;
  onSelectCategory: (categoryId: number | null) => void;
  disabled?: boolean;
  iconOnly?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
};

export default function CategorySelector({ item, onSelectCategory, disabled, iconOnly = false, onMenuOpen, onMenuClose }: Props) {
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  const { data: categories = [], isLoading } = useCategories();
  const category = getCategoryById(categories, item.category_id);

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
    onMenuOpen?.();
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    onMenuClose?.();
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

  const handleCreateCategorySubmit = (emoji: string, colour: string, name: string) => {
    createCategoryMutation.mutate({ name, emoji, colour });
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
      <CategoryChip
        category={category}
        iconOnly={iconOnly}
        onClick={disabled ? undefined : handleMenuOpen}
        sx={{
          ...(disabled && { pointerEvents: "none", opacity: 0.6 }),
        }}
      />

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
          return (
            <MenuItem
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              selected={item.category_id === cat.id}
            >
              <Typography variant="body2">
                {cat.emoji} {cat.name}
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
