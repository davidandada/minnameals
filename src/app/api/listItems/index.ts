"use server";

import { cookies } from "next/headers";
import appFetch from "../fetch";
import { ListItemApi } from "../../../types/api/minnameals/listItems";

// Helper to extract the cookie string on the server
async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

export async function getListItems() {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>("v1/list_items", { method: 'GET' }, cookieHeader);
  return data;
}

export async function createListItem(itemName: string) {
  const cookieHeader = await getAuthCookie();

  const data = await appFetch<ListItemApi[]>("v1/list_items", {
    method: "POST",
    body: { item: itemName }
  }, cookieHeader);

  return data[0];
}

export async function updateListItem(item: ListItemApi) {
  const cookieHeader = await getAuthCookie();

  const updatedItem = await appFetch<ListItemApi[]>("v1/list_items", {
    method: "PATCH",
    body: item
  }, cookieHeader);

  return updatedItem[0];
}