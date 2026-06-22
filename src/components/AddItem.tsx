"use client";

import { useState } from "react";
import { Alert, Box, Button, Snackbar, TextField, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { createListItem } from "@/api/listItems";
import Slide from "@mui/material/Slide";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListItemApi } from "@/types/api/listItems";

export default function AddItem() {
  const [inputShowing, setInputShowing] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");

  const [showSuccessSnack, setShowSuccessSnack] = useState<boolean | string>(false);
  const [showErrorSnack, setShowErrorSnack] = useState<boolean | string>(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createListItem,

    onMutate: async (newItemName) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });

      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);

      const optimisticItem: ListItemApi = {
        id: Date.now(),
        item: newItemName,
        is_checked: false,
        is_archived: false,
        created_at: "",
        updated_at: "",
        archived_at: null,
        position: "",
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
      setShowErrorSnack(err.message || "Error adding item");
    },

    onSuccess: (serverItem) => {
      setShowSuccessSnack(serverItem.item);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const toggleInputShowing = () => {
    setInputShowing(true);
  };

  const handleBlur = () => {
    setInputShowing(false);
    setItemName("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!itemName.trim()) return;
    createMutation.mutate(itemName);
    setItemName("");
  };

  return (
    <>
      <Button
        className="w-full normal-case flex gap-2 justify-start text-baedaGrey-50"
        disableRipple
        onClick={!inputShowing ? toggleInputShowing : undefined}
        size="large"
      >
        <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaPink-500" />
        {inputShowing ? (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              autoFocus
              color="baedaPink"
              fullWidth
              onBlur={handleBlur}
              onChange={(e) => setItemName(e.target.value)}
              size="small"
              value={itemName}
              variant="standard"
            />
          </Box>
        ) : (
          <Typography variant="body2">Add item</Typography>
        )}
      </Button>

      <Snackbar
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnack(false)}
        open={!!showSuccessSnack}
        slots={{ transition: Slide }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {showSuccessSnack} added!
        </Alert>
      </Snackbar>

      <Snackbar
        autoHideDuration={3000}
        onClose={() => setShowErrorSnack(false)}
        open={!!showErrorSnack}
        slots={{ transition: Slide }}
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          {showErrorSnack}
        </Alert>
      </Snackbar>
    </>
  );
}
