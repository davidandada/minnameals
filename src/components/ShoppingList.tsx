"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useSortListItems from "@/helpers/useSortListItems";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { generateKeyBetween } from "fractional-indexing";
import { Divider, List, Typography } from "@mui/material";
import { getListItems, updateListItem } from "@/api/listItems";
import AddItem from "@/components/AddItem";
import ItemRow from "@/components/ItemRow";
import { type ListItemApi } from "@/types/api/listItems";
import { isSortable } from "@dnd-kit/react/sortable";

export default function ShoppingList() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
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

  const [checkedItems, uncheckedItems] = useSortListItems(data || []);

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
      <List className="flex flex-col gap-2">
        <DragDropProvider onDragEnd={handleDrop}>{renderList(uncheckedItems)}</DragDropProvider>
        <Divider />
        <AddItem />
        <Divider />
        {renderList(checkedItems)}
      </List>
    </section>
  );
}
