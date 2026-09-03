"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isSortable } from "@dnd-kit/react/sortable";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { generateKeyBetween } from "fractional-indexing";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckIcon from "@mui/icons-material/Check";
import CategoryIcon from "@mui/icons-material/Category";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { getListItems, updateListItem } from "@/api/listItems";
import AddItem from "@/components/AddItem";
import ItemRow from "@/components/ItemRow";
import ManageCategoriesModal from "@/components/ManageCategoriesModal";
import useSortListItems from "@/helpers/useSortListItems";
import { useCategories, getCategoryById } from "@/helpers/categoryUtils";
import { useListContext, SortMode } from "@/context/ListContext";
import { type ListItemApi } from "@/types/api/listItems";

export default function ShoppingList() {
  const { sortMode, setSortMode, isSortModeReady, showCompleted, setShowCompleted, archiveAllMutation } =
    useListContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupByAnchorEl, setGroupByAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isGroupByOpen = Boolean(groupByAnchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setGroupByAnchorEl(null);
  };

  const handleOpenGroupBy = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setGroupByAnchorEl(event.currentTarget);
  };

  const handleCloseGroupBy = () => {
    setGroupByAnchorEl(null);
  };

  const handleSelectSortMode = (mode: SortMode) => {
    setSortMode(mode);
    handleCloseMenu();
  };

  const handleToggleShowCompleted = () => {
    setShowCompleted((prev) => !prev);
    handleCloseMenu();
  };

  const handleOpenCategoriesModal = () => {
    handleCloseMenu();
    setIsCategoriesModalOpen(true);
  };

  const handleOpenConfirmClear = () => {
    handleCloseMenu();
    setConfirmClearOpen(true);
  };

  const handleConfirmClear = () => {
    archiveAllMutation.mutate();
    setConfirmClearOpen(false);
  };

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: getListItems,
    refetchInterval: () => (process.env.NODE_ENV === "development" ? false : 3000),
  });
  const { data: categories = [] } = useCategories();

  const sortMutation = useMutation({
    mutationFn: updateListItem,

    onMutate: async (sortedItem) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]) || [];
      const updatedItems = previousItems.map((item) =>
        item.id === sortedItem.id ? { ...item, position: sortedItem.position } : item,
      );
      const sortedItems = updatedItems.sort((a, b) =>
        a.position.localeCompare(b.position, undefined, { numeric: true }),
      );
      queryClient.setQueryData<ListItemApi[]>(["items"], () => sortedItems);
      return { previousItems };
    },
  });

  const [checkedItems, uncheckedItems] = useSortListItems(data || [], sortMode);

  const renderSkeletonList = (count = 6) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ListItem key={i} disablePadding>
          <ListItemButton dense disabled sx={{ gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <Skeleton variant="text" width="40%" height={20} />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="rounded" width={58} height={22} sx={{ borderRadius: 4, mr: 0.5 }} />
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </ListItemButton>
        </ListItem>
      ))}
    </>
  );

  const renderList = (items: ListItemApi[]) => {
    if (!items || !items.length) return null;
    return (
      <>
        {items.map((listItem, index) => (
          <ItemRow key={listItem.id} item={listItem} index={index} />
        ))}
      </>
    );
  };

  const renderCategoryGroupedList = (items: ListItemApi[]) => {
    if (!items || !items.length) return null;

    // Group items by category name
    const groups: { label: string; items: ListItemApi[] }[] = [];
    let currentGroup: { label: string; items: ListItemApi[] } | null = null;

    for (const item of items) {
      const category = getCategoryById(categories, item.category_id);
      const categoryLabel = category
        ? `${category.emoji} ${category.name}`.trim()
        : "Uncategorised";

      if (!currentGroup || currentGroup.label !== categoryLabel) {
        currentGroup = { label: categoryLabel, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(item);
    }

    return (
      <>
        {groups.map((group) => (
          <Box key={group.label}>
            <Typography
              variant="overline"
              component="p"
              className="text-baedaGrey-50 opacity-50 px-2 mt-2"
            >
              {group.label}
            </Typography>
            {group.items.map((listItem, index) => (
              <ItemRow key={listItem.id} item={listItem} index={index} disableDrag />
            ))}
          </Box>
        ))}
      </>
    );
  };

  const handleDrop = (event: DragEndEvent) => {
    if (event.canceled) return;

    const { source } = event.operation;

    if (isSortable(source)) {
      const { initialIndex, index } = source;

      if (data && initialIndex !== index) {
        const currentItem = source.data;
        const nextItemPosition = uncheckedItems?.[index]?.position;
        const dataSortedByPosition = data.sort((a, b) => a.position.localeCompare(b.position));
        const prevItemPosition =
          dataSortedByPosition[dataSortedByPosition.map((item) => item.position).indexOf(nextItemPosition) - 1]
            .position;

        sortMutation.mutate({
          ...currentItem,
          position: generateKeyBetween(prevItemPosition, nextItemPosition),
        });
      }
    }
  };

  return (
    <section className="max-w-130.5 w-full mx-auto h-full flex flex-col overflow-hidden">
      {/* Sticky Header Row */}
      <Box className="flex items-center justify-between mb-4 flex-shrink-0">
        <Typography variant="h4" component="h2" className="text-baedaOrange-500 font-bold">
          Shopping list
        </Typography>

        <IconButton
          aria-label="more actions"
          aria-controls={isMenuOpen ? "shopping-list-actions-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? "true" : undefined}
          onClick={handleOpenMenu}
          sx={{
            color: "var(--mui-palette-baedaGrey-100)",
            backgroundColor: "var(--mui-palette-baedaGrey-700)",
            border: "1px solid var(--mui-palette-baedaGrey-700)",
            "&:hover": {
              backgroundColor: "var(--mui-palette-baedaGrey-600)",
            },
            width: 36,
            height: 36,
          }}
        >
          <MoreHorizIcon />
        </IconButton>

        {/* More Actions Menu */}
        <Menu
          id="shopping-list-actions-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: "16px",
                minWidth: 220,
                mt: 1,
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                py: 0.5,
              },
            },
          }}
        >
          {/* Categories Option */}
          <MenuItem onClick={handleOpenCategoriesModal} sx={{ py: 1.25, px: 2 }}>
            <ListItemIcon>
              <CategoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </MenuItem>

          {/* Group By Option */}
          <MenuItem onClick={handleOpenGroupBy} sx={{ py: 1.25, px: 2 }}>
            <ListItemIcon>
              <SortIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Group By"
              secondary={sortMode === "category" ? "Category" : "Default"}
              slotProps={{ secondary: { variant: "caption" } }}
            />
            <ChevronRightIcon fontSize="small" sx={{ opacity: 0.5, ml: 1 }} />
          </MenuItem>

          {/* Show / Hide Completed Option */}
          <MenuItem onClick={handleToggleShowCompleted} sx={{ py: 1.25, px: 2 }}>
            <ListItemIcon>
              {showCompleted ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={showCompleted ? "Hide Completed" : "Show Completed"} />
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          {/* Clear List Option */}
          <MenuItem onClick={handleOpenConfirmClear} sx={{ py: 1.25, px: 2, color: "var(--mui-palette-baedaRed-500)" }}>
            <ListItemIcon sx={{ color: "var(--mui-palette-baedaRed-500)" }}>
              <DeleteRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Clear"
              slotProps={{
                primary: {
                  sx: { fontWeight: 600 },
                },
              }}
            />
          </MenuItem>
        </Menu>

        {/* Group By Sub-menu */}
        <Menu
          id="shopping-list-group-by-submenu"
          anchorEl={groupByAnchorEl}
          open={isGroupByOpen}
          onClose={handleCloseGroupBy}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "left", vertical: "top" }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: "14px",
                minWidth: 160,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                py: 0.5,
              },
            },
          }}
        >
          <MenuItem onClick={() => handleSelectSortMode("position")} sx={{ py: 1, px: 2 }}>
            <ListItemText primary="Default" />
            {sortMode === "position" && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
          </MenuItem>
          <MenuItem onClick={() => handleSelectSortMode("category")} sx={{ py: 1, px: 2 }}>
            <ListItemText primary="Category" />
            {sortMode === "category" && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
          </MenuItem>
        </Menu>
      </Box>

      {/* Only Scrollable Element: Shopping List */}
      <Box className="flex-1 overflow-y-auto min-h-0 pr-1">
        <List className="flex flex-col gap-2">
          {!isSortModeReady || isLoading ? (
            renderSkeletonList()
          ) : sortMode === "category" ? (
            renderCategoryGroupedList(uncheckedItems)
          ) : (
            <DragDropProvider onDragEnd={handleDrop}>{renderList(uncheckedItems)}</DragDropProvider>
          )}
          {uncheckedItems.length > 0 && <Divider />}
          <AddItem />
          {showCompleted && checkedItems.length > 0 && (
            <>
              <Divider />
              {!isSortModeReady || isLoading ? renderSkeletonList(3) : renderList(checkedItems)}
            </>
          )}
        </List>
      </Box>

      {/* Clear Confirmation Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--mui-palette-baedaGrey-800)",
              backgroundImage: "none",
              border: "1px solid var(--mui-palette-baedaGrey-700)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "380px",
              p: 0.5,
            },
          },
        }}
      >
        <DialogTitle
          id="clear-dialog-title"
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: "var(--mui-palette-baedaOrange-500)", fontSize: 26 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: "var(--mui-palette-baedaGrey-50)" }}>
            Clear shopping list?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1, px: 3 }}>
          <DialogContentText
            id="clear-dialog-description"
            sx={{
              color: "var(--mui-palette-baedaGrey-200)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
            }}
          >
            This will archive all items currently on your shopping list. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmClearOpen(false)}
            color="baedaRed"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClear}
            color="baedaRed"
            variant="contained"
            size="small"
            autoFocus
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 2,
            }}
          >
            Clear List
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        open={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </section>
  );
}
