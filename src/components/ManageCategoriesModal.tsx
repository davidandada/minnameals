"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryChip from "@/components/CategoryChip";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import SwipeableRow from "@/components/common/SwipeableRow";
import { createCategory, updateCategory } from "@/api/categories";
import { useCategories } from "@/helpers/categoryUtils";
import { useNotification } from "@/components/NotificationProvider";
import { CategoryApi } from "@/types/api/category";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ManageCategoriesModal({ open, onClose }: Props) {
  const { data: categories = [], isLoading } = useCategories();
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const [editingCategory, setEditingCategory] = useState<CategoryApi | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCat) => {
      showSuccess(`Category "${newCat.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
    },
    onError: (err: Error) => {
      showError(err.message || "Error creating category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (cat, variables) => {
      if (variables.is_archived) {
        showSuccess(`Category deleted!`);
      } else {
        showSuccess(`Category updated!`);
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      setDeletingCategoryId(null);
    },
    onError: (err: Error) => {
      setDeletingCategoryId(null);
      showError(err.message || "Error updating category");
    },
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleOpenEdit = (cat: CategoryApi) => {
    setEditingCategory(cat);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = (cat: CategoryApi) => {
    setDeletingCategoryId(cat.id);
    updateCategoryMutation.mutate({ id: cat.id, is_archived: true });
  };

  const handleCategoryFormSubmit = (emoji: string, colour: string, name: string) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        name,
        emoji,
        colour,
      });
    } else {
      createCategoryMutation.mutate({ name, emoji, colour });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--mui-palette-baedaGrey-800)",
              backgroundImage: "none",
              border: "1px solid var(--mui-palette-baedaGrey-700)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" component="span" color="baedaOrange" sx={{ fontWeight: "bold" }}>
            Categories
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 1, px: 2 }}>
          {isLoading ? (
            <Typography variant="body2" sx={{ py: 2, textAlign: "center", opacity: 0.6 }}>
              Loading categories...
            </Typography>
          ) : categories.length === 0 ? (
            <Typography variant="body2" sx={{ py: 3, textAlign: "center", opacity: 0.6 }}>
              No categories found.
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {categories.map((cat, idx) => (
                <React.Fragment key={cat.id}>
                  {idx > 0 && <Divider component="li" sx={{ borderColor: "var(--mui-palette-baedaGrey-700)" }} />}
                  <SwipeableRow
                    onDelete={() => handleDeleteCategory(cat)}
                    onClick={() => handleOpenEdit(cat)}
                    isDeleting={deletingCategoryId === cat.id && updateCategoryMutation.isPending}
                    deleteLabel={`delete category ${cat.name}`}
                    sx={{
                      justifyContent: "space-between",
                      py: 1,
                    }}
                  >
                    <CategoryChip category={cat} />
                  </SwipeableRow>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            color="baedaOrange"
            size="small"
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Add Category
          </Button>
          <Button onClick={onClose} color="baedaRed" size="small" sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Create / Edit Modal */}
      <CreateCategoryModal
        open={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSubmit={handleCategoryFormSubmit}
        initialCategory={editingCategory}
        isPending={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />
    </>
  );
}
