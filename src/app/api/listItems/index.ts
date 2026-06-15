"use server";

import appFetch from "../fetch";
import { ListItemApi, NewItem } from "../../../types/api/minnameals/listItems";

export async function getListItems() {
  const data = await appFetch("v1/list_items");
  return data;
}

export async function createListItem(itemName: string) {
  const data = await appFetch("v1/list_items", { method: "POST", body: { item: itemName } });
  return data[0];
}

export async function updateListItem(item: ListItemApi) {
  const updatedItem = await appFetch("v1/list_items", { method: "PATCH", body: item })
  return updatedItem[0];
}