"use server";

import { cookies } from "next/headers";
import appFetch from "@/api/fetch";
import { ListItemApi } from "@/types/api/listItems";

async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

export async function getListItems() {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>("v1/item", { method: "GET" }, cookieHeader);
  return data;
}

export async function createListItem({ itemName, position }: { itemName: string, position: string }) {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>(
    "v1/item",
    {
      method: "POST",
      body: { item: itemName, position },
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