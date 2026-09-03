"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isSortable } from "@dnd-kit/react/sortable";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { generateKeyBetween } from "fractional-indexing";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Skeleton,
  Typography,
} from "@mui/material";
import { getListItems, updateListItem } from "@/api/listItems";
import AddItem from "@/components/AddItem";
import ItemRow from "@/components/ItemRow";
import ShoppingListActions from "@/components/ShoppingListActions";
import useSortListItems from "@/helpers/useSortListItems";
import { useCategories, getCategoryById } from "@/helpers/categoryUtils";
import { useListPreferences } from "@/helpers/listPreferences";
import { type ListItemApi } from "@/types/api/listItems";

export default function ShoppingList() {
  const {
    sortMode,
    setSortMode,
    isSortModeReady,
    showCompleted,
    setShowCompleted,
    archiveAllMutation,
  } = useListPreferences();

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

        <ShoppingListActions
          sortMode={sortMode}
          onSelectSortMode={setSortMode}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted((prev) => !prev)}
          onClearList={() => archiveAllMutation.mutate()}
          isClearing={archiveAllMutation.isPending}
        />
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
    </section>
  );
}
