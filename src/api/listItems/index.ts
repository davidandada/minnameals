"use server";

import appFetch from "@/api/fetch";
import { ListItemApi } from "@/types/api/listItems";
import { getAuthCookie } from "@/api/utils";

export async function getListItems() {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>("v1/item", { method: "GET" }, cookieHeader);
  return data;
}

export async function createListItem({ itemName, position, category_id }: { itemName: string, position: string, category_id?: number | null }) {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>(
    "v1/item",
    {
      method: "POST",
      body: { item: itemName, position, ...(category_id && { category_id }) },
    },
    cookieHeader,
  );

  return data[0];
}

export async function updateListItem(item: ListItemApi) {
  const cookieHeader = await getAuthCookie();

  const updatedItem = await appFetch<ListItemApi[]>(
    "v1/item",
    {
      method: "PATCH",
      body: item,
    },
    cookieHeader,
  );

  return updatedItem[0];
}

export async function archiveAllListItems() {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>(
    "v1/item/archive_all",
    {
      method: "PATCH",
    },
    cookieHeader,
  );

  return data;
}