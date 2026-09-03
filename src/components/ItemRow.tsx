"use client";

import { useRef, useState } from "react";
import classNames from "classnames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  Box,
  Checkbox,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CategorySelector from "@/components/CategorySelector";
import SwipeableRow from "@/components/common/SwipeableRow";
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
    disabled: item.is_checked || disableDrag || isItemInEdit,
  });

  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateListItem,

    onMutate: async (updatedItemData) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });

      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);

      queryClient.setQueryData<ListItemApi[]>(["items"], (old) => {
        if (!old) return [];
        return old.map((oldItem) => {
          if (oldItem.id === updatedItemData.id) {
            return {
              ...oldItem,
              ...updatedItemData,
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
    },
  });

  const isDeleting = Boolean(updateMutation.isPending && updateMutation.variables?.is_archived);

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

  return (
    <SwipeableRow
      dndRef={ref}
      onDelete={handleDeleted}
      isDeleting={isDeleting}
      disabled={isItemInEdit}
      onClick={isItemInEdit ? undefined : enterEditMode}
      deleteLabel="delete item"
      onBlur={() => {
        if (!isItemInEdit) return;
        editBlurTimeoutRef.current = setTimeout(() => {
          if (isCategoryMenuOpenRef.current) return;
          saveAndExitEdit();
        }, 200);
      }}
      onFocus={cancelPendingBlur}
    >
      {/* Generous Hitbox Checkbox / Radio toggle */}
      <ListItemIcon sx={{ minWidth: 0, mr: 1.5, display: "flex", alignItems: "center" }}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          sx={{
            p: 0.75,
            m: -0.75,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "var(--mui-palette-baedaOrange-100)",
              opacity: 0.8,
            },
          }}
          aria-label={isChecked ? "Mark unchecked" : "Mark checked"}
        >
          <Checkbox
            checked={isChecked}
            checkedIcon={<CheckCircleIcon sx={{ fontSize: 24 }} className="text-baedaOrange-200" />}
            disableRipple
            icon={<CircleOutlinedIcon sx={{ fontSize: 24 }} className="text-baedaGrey-50" />}
            slotProps={{ input: { "aria-labelledby": `shopping-list-item-${item.id}` } }}
            tabIndex={-1}
            sx={{ p: 0, pointerEvents: "none" }}
          />
        </Box>
      </ListItemIcon>

      {/* Row Text Content / Inline Edit Form */}
      {isItemInEdit ? (
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            cancelPendingBlur();
            saveAndExitEdit();
          }}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
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
          sx={{ minWidth: 0, flexGrow: 1 }}
        />
      )}

      {/* Category Pill at the End of Row */}
      <CategorySelector
        item={item}
        disabled={updateMutation.isPending}
        iconOnly={false}
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
    </SwipeableRow>
  );
}
