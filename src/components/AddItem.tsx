"use client";

import { useRef, useState } from "react";
import { generateKeyBetween } from "fractional-indexing";
import { Box, Button, TextField, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { createListItem } from "@/api/listItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@/components/NotificationProvider";
import CategorySelector from "@/components/CategorySelector";
import { ListItemApi } from "@/types/api/listItems";

export default function AddItem() {
  const [inputShowing, setInputShowing] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isCategoryMenuOpenRef = useRef<boolean>(false);

  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  // Dummy item for CategorySelector — reflects local category selection state
  const dummyItem: ListItemApi = {
    id: 0,
    item: "",
    is_checked: false,
    is_archived: false,
    created_at: "",
    updated_at: "",
    archived_at: null,
    position: "",
    category_id: categoryId,
  };

  const createMutation = useMutation({
    mutationFn: createListItem,

    onMutate: async ({ itemName, position, category_id }) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });

      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);

      const optimisticItem: ListItemApi = {
        id: Date.now(),
        item: itemName,
        is_checked: false,
        is_archived: false,
        created_at: "",
        updated_at: "",
        archived_at: null,
        position: position,
        category_id: category_id ?? null,
      };

      queryClient.setQueryData<ListItemApi[]>(["items"], (old) => {
        return old ? [...old, optimisticItem] : [optimisticItem];
      });

      return { previousItems };
    },

    onError: (err, newItemName, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      showError(err.message || "Error adding item");
    },

    onSuccess: (serverItem) => {
      showSuccess(`${serverItem.item} added!`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const resetForm = () => {
    setInputShowing(false);
    setItemName("");
    setCategoryId(null);
  };

  const handleFormBlur = () => {
    if (isCategoryMenuOpenRef.current) return;
    blurTimeoutRef.current = setTimeout(resetForm, 200);
  };

  const handleFormFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!itemName.trim()) return;

    const cachedData = queryClient.getQueryData<ListItemApi[]>(["items"]) ?? [];
    const positionSortedData = [...cachedData].sort((a, b) => a.position.localeCompare(b.position));
    const lastItem = positionSortedData[positionSortedData.length - 1];
    const lastPosition = lastItem ? lastItem.position : null;

    createMutation.mutate({
      itemName: itemName,
      position: generateKeyBetween(lastPosition, null),
      category_id: categoryId,
    });

    setItemName("");
    setCategoryId(null);
  };

  const handleCategorySelect = (newCategoryId: number | null) => {
    handleFormFocus();
    setCategoryId(newCategoryId);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCategoryMenuOpen = () => {
    isCategoryMenuOpenRef.current = true;
    handleFormFocus();
  };

  const handleCategoryMenuClose = () => {
    isCategoryMenuOpenRef.current = false;
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return inputShowing ? (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onBlur={handleFormBlur}
      onFocus={handleFormFocus}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        color: "inherit",
        px: 1,
        py: 0.75,
      }}
    >
      <Box sx={{ p: 0.75, m: -0.75, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", mr: 1.5 }}>
        <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaPink-500" />
      </Box>
      <TextField
        autoFocus
        inputRef={inputRef}
        color="baedaPink"
        fullWidth
        multiline
        onChange={(e) => setItemName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
          } else if (e.key === "Escape") {
            e.preventDefault();
            resetForm();
          }
        }}
        size="small"
        value={itemName}
        variant="standard"
        slotProps={{
          input: {
            sx: {
              typography: "body2",
            },
          },
        }}
      />
      <CategorySelector
        item={dummyItem}
        onSelectCategory={handleCategorySelect}
        onMenuOpen={handleCategoryMenuOpen}
        onMenuClose={handleCategoryMenuClose}
      />
    </Box>
  ) : (
    <Button
      disableRipple
      onClick={() => setInputShowing(true)}
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        textTransform: "none",
        color: "inherit",
        px: 1,
        py: 0.75,
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: "var(--mui-palette-baedaGrey-700)",
        },
      }}
    >
      <Box sx={{ p: 0.75, m: -0.75, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", mr: 1.5 }}>
        <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaPink-500" />
      </Box>
      <Typography variant="body2">Add item</Typography>
    </Button>
  );
}
