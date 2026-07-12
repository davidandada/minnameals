"use client";

import { useEffect, useState } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import SortIcon from "@mui/icons-material/Sort";
import { getListItems, updateListItem } from "@/api/listItems";
import AddItem from "@/components/AddItem";
import ItemRow from "@/components/ItemRow";
import useSortListItems from "@/helpers/useSortListItems";
import { splitCategoryName } from "@/helpers/categoryUtils";
import { type ListItemApi } from "@/types/api/listItems";

type SortMode = "position" | "category";

export default function ShoppingList() {
  const [sortMode, setSortMode] = useState<SortMode>("position");
  const [isSortModeReady, setIsSortModeReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("baeda_sort_mode") as SortMode | null;
    if (stored) setSortMode(stored);
    setIsSortModeReady(true);
  }, []);

  const handleSortModeChange = (_: React.MouseEvent<HTMLElement>, newMode: SortMode | null) => {
    if (newMode !== null) {
      setSortMode(newMode);
      localStorage.setItem("baeda_sort_mode", newMode);
    }
  };
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: getListItems,
    refetchInterval: () => (process.env.NODE_ENV === "development" ? false : 3000),
  });

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
      const categoryLabel = item.category
        ? `${splitCategoryName(item.category.name).emoji} ${splitCategoryName(item.category.name).name}`.trim()
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
    <section className="max-w-130.5 mx-auto">
      <Typography variant="h4" component="h2" className="mb-6 text-baedaOrange-500">
        Shopping list
      </Typography>
      <Box className="flex items-center gap-3 mb-2">
        <Typography variant="body1" component="h3">Sort by:</Typography>
        {!isSortModeReady || isLoading ? (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Skeleton variant="rounded" width={90} height={30} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={100} height={30} sx={{ borderRadius: 1 }} />
          </Box>
        ) : (
          <ToggleButtonGroup
            exclusive
            value={sortMode}
            onChange={handleSortModeChange}
            aria-label="sort mode"
            size="small"
          >
            <ToggleButton value="position" aria-label="sort by position">
              <SortIcon fontSize="small" sx={{ mr: 0.5 }} />
              Default
            </ToggleButton>
            <ToggleButton value="category" aria-label="sort by category">
              <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
              Category
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
      <List className="flex flex-col gap-2">
        {!isSortModeReady || isLoading ? (
          renderSkeletonList()
        ) : sortMode === "category" ? (
          renderCategoryGroupedList(uncheckedItems)
        ) : (
          <DragDropProvider onDragEnd={handleDrop}>{renderList(uncheckedItems)}</DragDropProvider>
        )}
        <Divider />
        <AddItem />
        <Divider />
        {!isSortModeReady || isLoading ? renderSkeletonList(3) : renderList(checkedItems)}
      </List>
    </section>
  );
}
