"use client";

import React, { useState } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { updateListItem } from "@/api/listItems";
import { type ListItemApi } from "@/types/api/listItems";

type Props = {
  item: ListItemApi;
  index: number;
};

export default function ItemRow({ item, index }: Props) {
  const [isItemInEdit, setIsItemInEdit] = useState<boolean>(false);
  const [updatedItemName, setUpdatedItemName] = useState(item.item);
  const { ref } = useSortable({
    id: item.id,
    index,
    data: item,
    disabled: item.is_checked,
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateListItem,

    onMutate: async (updatedItemData) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });

      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);

      queryClient.setQueryData<ListItemApi[]>(["items"], (old) => {
        if (!old) return [];
        return old.map((oldItem) => (oldItem.id === updatedItemData.id ? { ...oldItem, ...updatedItemData } : oldItem));
      });

      return { previousItems };
    },

    onError: (err, updatedItemData, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setTimeout(() => {
        updateMutation.reset();
      }, 1000);
    },
  });

  const handleToggle = () => {
    if (isItemInEdit) return;
    updateMutation.mutate({ ...item, is_checked: !item.is_checked });
  };

  const handleDeleted = () => {
    updateMutation.mutate({ ...item, is_archived: true });
  };

  const handleItemNameUpdated = () => {
    updateMutation.mutate({ ...item, item: updatedItemName });
  };

  const toggleEditForItem = () => {
    setIsItemInEdit((prev) => {
      if (!prev) setUpdatedItemName(item.item);
      return !prev;
    });
  };

  const updateItemName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedItemName(e.currentTarget.value);
  };

  const handleUpdateItemName = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!updatedItemName.trim()) {
      handleDeleted();
    } else if (
      "relatedTarget" in event &&
      ((event.relatedTarget as Element)?.id === "cancelIcon" ||
        (event.relatedTarget as Element)?.id === "editItemInput")
    ) {
      setUpdatedItemName(item.item);
    } else if (item.item !== updatedItemName) {
      handleItemNameUpdated();
    }
    setIsItemInEdit(false);
  };

  const isChecked = item.is_checked;

  const renderSecondaryAction = () => {
    if (updateMutation.isPending)
      return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CircularProgress color="baedaRed" size={18} />
        </Box>
      );
    if (updateMutation.isSuccess) return <CheckIcon color="baedaGreen" />;
    if (updateMutation.isError) return <ClearIcon color="baedaRed" />;
    else
      return (
        <>
          <IconButton
            aria-label="edit"
            color={isItemInEdit ? "warning" : "info"}
            id="cancelIcon"
            onClick={toggleEditForItem}
          >
            {isItemInEdit ? <CancelIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          <IconButton aria-label="delete" color="error" onClick={handleDeleted}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </>
      );
  };

  return (
    <ListItem disablePadding key={item.id} ref={ref} secondaryAction={renderSecondaryAction()}>
      <ListItemButton role={undefined} onClick={handleToggle} dense>
        <ListItemIcon>
          <Checkbox
            checked={isChecked}
            checkedIcon={<CheckCircleIcon className="text-baedaOrange-200" />}
            disableRipple
            edge="start"
            icon={<CircleOutlinedIcon className="text-baedaGrey-50" />}
            slotProps={{ input: { "aria-labelledby": `shopping-list-item-${item.id}` } }}
            tabIndex={-1}
          />
        </ListItemIcon>
        {isItemInEdit ? (
          <Box component="form" onSubmit={handleUpdateItemName} sx={{ width: "80%" }}>
            <TextField
              autoFocus
              color="baedaOrange"
              fullWidth
              id="editItemInput"
              onBlur={handleUpdateItemName}
              onChange={updateItemName}
              size="small"
              value={updatedItemName}
              variant="standard"
            />
          </Box>
        ) : (
          <ListItemText
            className={classNames(isChecked ? "line-through text-baedaOrange-200" : "text-baedaGrey-50")}
            id={`shopping-list-item-${item.id}`}
            primary={item.item}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
}
