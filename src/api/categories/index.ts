"use server";

import appFetch from "@/api/fetch";
import { getAuthCookie } from "@/api/utils";
import { type CategoryApi } from "@/types/api/category";

export async function getCategories() {
  const cookieHeader = await getAuthCookie();
  return appFetch<CategoryApi[]>("v1/category", { method: "GET" }, cookieHeader);
}

export async function createCategory({
  name,
  emoji,
  colour,
}: {
  name: string;
  emoji: string;
  colour: string;
}) {
  const cookieHeader = await getAuthCookie();
  const data = await appFetch<CategoryApi[]>(
    "v1/category",
    {
      method: "POST",
      body: { name, emoji, colour },
    },
    cookieHeader,
  );
  return data[0];
}

export async function updateCategory(category: Partial<CategoryApi> & { id: number }) {
  const cookieHeader = await getAuthCookie();
  const data = await appFetch<CategoryApi[]>(
    "v1/category",
    {
      method: "PATCH",
      body: category,
    },
    cookieHeader,
  );
  return data[0];
}
