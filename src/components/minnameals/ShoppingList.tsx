"use client";

import { useMemo, useState } from "react";
import { Divider, List, Typography } from "@mui/material";
import { type ListItemApi } from "../../types/api/minnameals/listItems";
import AddItem from "./AddItem";
import ItemRow from "./ItemRow";

type Props = {
  data: ListItemApi[];
};

export default function ShoppingList({ data }: Props) {
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
    <List className="max-w-130.5 mx-auto h-6 flex flex-col gap-2">
      <Typography variant="h4" component="h2" className="mb-6 text-baedaOrange-500">
        Shopping list
      </Typography>
      {renderList(uncheckedItems)}
      {renderList(checkedItems)}
      <AddItem />
    </List>
  );
}
