"use client";

import { useQuery } from "@tanstack/react-query";
import useSortListItems from "@/helpers/useSortListItems";
import { Divider, List, Typography } from "@mui/material";
import { getListItems } from "@/api/listItems";
import AddItem from "@/components/AddItem";
import ItemRow from "@/components/ItemRow";
import { type ListItemApi } from "@/types/api/listItems";

export default function ShoppingList() {
  const { data } = useQuery({
    queryKey: ["items"],
    queryFn: getListItems,
    refetchInterval: () => (process.env.NODE_ENV === "development" ? false : 3000),
  });

  const [checkedItems, uncheckedItems] = useSortListItems(data || []);

  const renderList = (items: ListItemApi[]) => {
    if (!items || !items.length) return null;
    return (
      <>
        {items.map((listItem) => (
          <ItemRow key={listItem.id} item={listItem} />
        ))}
      </>
    );
  };

  return (
    <section className="max-w-130.5 mx-auto">
      <Typography variant="h4" component="h2" className="mb-6 text-baedaOrange-500">
        Shopping list
      </Typography>
      <List className="flex flex-col gap-2">
        {renderList(uncheckedItems)}
        <Divider />
        <AddItem />
        <Divider />
        {renderList(checkedItems)}
      </List>
    </section>
  );
}
