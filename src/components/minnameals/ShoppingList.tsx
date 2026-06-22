"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Divider, List, Typography } from "@mui/material";
import { getListItems } from "@/api/listItems";
import AddItem from "@/components/minnameals/AddItem";
import ItemRow from "@/components/minnameals/ItemRow";
import { type ListItemApi } from "@/types/api/minnameals/listItems";

export default function ShoppingList() {
  const { data } = useQuery({
    queryKey: ["items"],
    queryFn: getListItems,
    refetchInterval: () => (process.env.NODE_ENV === "development" ? false : 3000),
  });

  const [uncheckedItems, checkedItems] = useMemo(() => {
    if (!data || !data.length) return [[], []];
    return data.reduce<[ListItemApi[], ListItemApi[]]>(
      (acc, item) => {
        if (item.is_checked) {
          acc[1].push(item);
        } else {
          acc[0].push(item);
        }
        return acc;
      },
      [[], []],
    );
  }, [data]);

  const renderList = (items: ListItemApi[]) => {
    if (!items || !items.length) return null;
    return (
      <>
        {items.map((listItem) => (
          <ItemRow key={listItem.id} item={listItem} />
        ))}
        <Divider />
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
        {renderList(checkedItems)}
        <AddItem />
      </List>
    </section>
  );
}
