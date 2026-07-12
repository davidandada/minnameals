"use server";

import appFetch from "@/api/fetch";
import { getAuthCookie } from "@/api/utils";

export type CategoryApi = {
  id: number;
  name: string;
  is_archived: boolean;
  position: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export async function getCategories() {
  const cookieHeader = await getAuthCookie();
  return appFetch<CategoryApi[]>("v1/category", { method: "GET" }, cookieHeader);
}

export async function createCategory({ name }: { name: string }) {
  const cookieHeader = await getAuthCookie();
  const data = await appFetch<CategoryApi[]>(
    "v1/category",
    {
      method: "POST",
      body: { name },
    },
    cookieHeader,
  );
  return data[0];
}
