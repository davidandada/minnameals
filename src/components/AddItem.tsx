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
  const [categoryData, setCategoryData] = useState<{ id: number; name: string } | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    category: categoryData,
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
        category: categoryData,
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
    setCategoryData(null);
  };

  const handleFormBlur = () => {
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
    setCategoryData(null);
  };

  const handleCategorySelect = (newCategoryId: number | null) => {
    setCategoryId(newCategoryId);
    if (newCategoryId === null) {
      setCategoryData(null);
    } else {
      const categories = queryClient.getQueryData<{ id: number; name: string }[]>(["categories"]) ?? [];
      const cat = categories.find((c) => c.id === newCategoryId);
      setCategoryData(cat ? { id: cat.id, name: cat.name } : null);
    }
  };

  return inputShowing ? (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onBlur={handleFormBlur}
      onFocus={handleFormFocus}
      className="w-full flex gap-2 justify-start items-center text-baedaGrey-50 px-[22px] py-[8px]"
    >
      <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaPink-500" />
      <TextField
        autoFocus
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
      />
    </Box>
  ) : (
    <Button
      className="w-full normal-case flex gap-2 justify-start text-baedaGrey-50"
      disableRipple
      onClick={() => setInputShowing(true)}
      size="large"
    >
      <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaPink-500" />
      <Typography variant="body2">Add item</Typography>
    </Button>
  );
}
