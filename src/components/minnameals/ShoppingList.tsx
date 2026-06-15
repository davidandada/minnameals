"use client";

import { useMemo } from "react";
import { Divider, List, Typography } from "@mui/material";
import { type ListItemApi } from "../../types/api/minnameals/listItems";
import AddItem from "./AddItem";
import ItemRow from "./ItemRow";
import { useQuery } from "@tanstack/react-query";
import { getListItems } from "../../app/api/listItems";

export default function ShoppingList() {
  const { data } = useQuery({
    queryKey: ["items"],
    queryFn: getListItems,
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
