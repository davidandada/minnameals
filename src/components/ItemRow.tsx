"use client";

import React, { useRef, useState } from "react";
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
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import CategorySelector from "@/components/CategorySelector";
import { useNotification } from "@/components/NotificationProvider";
import { updateListItem } from "@/api/listItems";
import { type ListItemApi } from "@/types/api/listItems";

type Props = {
  item: ListItemApi;
  index: number;
  disableDrag?: boolean;
};

export default function ItemRow({ item, index, disableDrag = false }: Props) {
  const [isItemInEdit, setIsItemInEdit] = useState<boolean>(false);
  const [updatedItemName, setUpdatedItemName] = useState(item.item);
  const { ref } = useSortable({
    id: item.id,
    index,
    data: item,
    disabled: item.is_checked || disableDrag,
  });

  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateListItem,

    onMutate: async (updatedItemData) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });

      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);
      const categories = queryClient.getQueryData<any[]>(["categories"]) || [];

      queryClient.setQueryData<ListItemApi[]>(["items"], (old) => {
        if (!old) return [];
        return old.map((oldItem) => {
          if (oldItem.id === updatedItemData.id) {
            const matchedCategory = updatedItemData.category_id
              ? categories.find((c) => c.id === updatedItemData.category_id)
              : null;
            return {
              ...oldItem,
              ...updatedItemData,
              category: matchedCategory
                ? { id: matchedCategory.id, name: matchedCategory.name }
                : null,
            };
          }
          return oldItem;
        });
      });

      return { previousItems };
    },

    onError: (err, updatedItemData, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      showError(err.message || "Error updating item");
    },

    onSuccess: (serverItem) => {
      if (serverItem.is_archived) {
        showSuccess(`${serverItem.item} deleted!`);
      } else if (serverItem.is_checked !== item.is_checked) {
        showSuccess(serverItem.is_checked ? `${serverItem.item} checked!` : `${serverItem.item} unchecked!`);
      } else {
        showSuccess(`${serverItem.item} updated!`);
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

  const editBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCategoryMenuOpenRef = useRef(false);

  const cancelPendingBlur = () => {
    if (editBlurTimeoutRef.current) {
      clearTimeout(editBlurTimeoutRef.current);
      editBlurTimeoutRef.current = null;
    }
  };

  const saveAndExitEdit = () => {
    if (!updatedItemName.trim()) {
      handleDeleted();
    } else if (item.item !== updatedItemName) {
      handleItemNameUpdated();
    }
    setIsItemInEdit(false);
  };

  const cancelEdit = () => {
    cancelPendingBlur();
    setUpdatedItemName(item.item);
    setIsItemInEdit(false);
  };

  const enterEditMode = () => {
    setUpdatedItemName(item.item);
    setIsItemInEdit(true);
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
        <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <IconButton
            aria-label="edit"
            color={isItemInEdit ? "warning" : "info"}
            id="cancelIcon"
            onClick={isItemInEdit ? cancelEdit : enterEditMode}
          >
            {isItemInEdit ? <CancelIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          <IconButton aria-label="delete" color="error" onClick={handleDeleted}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      );
  };

  return (
    <ListItem disablePadding key={item.id} ref={ref}>
      <ListItemButton
        role={undefined}
        onClick={handleToggle}
        dense
        onBlur={() => {
          if (!isItemInEdit) return;
          editBlurTimeoutRef.current = setTimeout(() => {
            if (isCategoryMenuOpenRef.current) return;
            saveAndExitEdit();
          }, 200);
        }}
        onFocus={cancelPendingBlur}
      >
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
          <Box component="form" onSubmit={(e) => { e.preventDefault(); cancelPendingBlur(); saveAndExitEdit(); }} sx={{ flexGrow: 1, minWidth: 0 }}>
            <TextField
              autoFocus
              onFocus={(e) => {
                const len = e.target.value.length;
                e.target.setSelectionRange(len, len);
              }}
              color="baedaOrange"
              fullWidth
              id="editItemInput"
              multiline
              onChange={(e) => setUpdatedItemName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  cancelPendingBlur();
                  saveAndExitEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              size="small"
              value={updatedItemName}
              variant="standard"
              slotProps={{
                input: {
                  sx: {
                    typography: "body2",
                  },
                },
              }}
            />
          </Box>
        ) : (
          <ListItemText
            className={classNames(isChecked ? "line-through text-baedaOrange-200" : "text-baedaGrey-50")}
            id={`shopping-list-item-${item.id}`}
            primary={item.item}
            sx={{ minWidth: 0 }}
          />
        )}
        <CategorySelector
          item={item}
          disabled={updateMutation.isPending}
          iconOnly={!isItemInEdit}
          onMenuOpen={() => {
            isCategoryMenuOpenRef.current = true;
            cancelPendingBlur();
          }}
          onMenuClose={() => {
            isCategoryMenuOpenRef.current = false;
          }}
          onSelectCategory={(categoryId) => {
            updateMutation.mutate({ ...item, category_id: categoryId });
          }}
        />
        {renderSecondaryAction()}
      </ListItemButton>
    </ListItem>
  );
}
