"use client";

import { useState } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListItem, IconButton, ListItemButton, ListItemIcon, Checkbox, ListItemText, TextField } from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { updateListItem } from "@/api/listItems";
import { type ListItemApi } from "@/types/api/minnameals/listItems";

type Props = {
  item: ListItemApi;
};

export default function ItemRow({ item }: Props) {
  const [isItemInEdit, setIsItemInEdit] = useState<boolean>(false);
  const [updatedItemName, setUpdatedItemName] = useState(item.item);

  const queryClient = useQueryClient();

  // Optimistic Update Mutation
  const updateMutation = useMutation({
    mutationFn: updateListItem,

    // 1. Fire immediately when mutate is called
    onMutate: async (updatedItemData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["items"] });

      // Snapshot the previous state in case we need to roll back
      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);

      // Optimistically update the cache with the new data
      queryClient.setQueryData<ListItemApi[]>(["items"], (old) => {
        if (!old) return [];
        return old.map((oldItem) => (oldItem.id === updatedItemData.id ? { ...oldItem, ...updatedItemData } : oldItem));
      });

      // Return a context object with the snapshotted value
      return { previousItems };
    },

    // 2. If the mutation fails, use the context to roll back the UI
    onError: (err, updatedItemData, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
    },

    // 3. Always refetch after error or success to ensure absolute synchronization
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
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

  const handleEditInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!updatedItemName.trim()) {
      handleDeleted();
    } else if (event.relatedTarget?.id === "cancelIcon" || event.relatedTarget?.id === "editItemInput") {
      setUpdatedItemName(item.item);
    } else if (item.item !== updatedItemName) {
      handleItemNameUpdated();
    }
    setIsItemInEdit(false);
  };

  const isChecked = item.is_checked;

  return (
    <ListItem
      disablePadding
      key={item.id}
      secondaryAction={
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
      }
    >
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
          <TextField
            autoFocus
            color="baedaOrange"
            fullWidth
            id="editItemInput"
            onBlur={handleEditInputBlur}
            onChange={updateItemName}
            size="small"
            value={updatedItemName}
            variant="standard"
          />
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
