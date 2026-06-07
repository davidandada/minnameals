import { Typography } from "@mui/material";
import ShoppingList from "../components/minnameals/ShoppingList";
import appFetch from "./api/fetch";

export const dynamic = "force-dynamic";

export default async function Home() {
  const res = await appFetch("v1/list_items");
  if (!res.ok) {
    console.error(`Flask API Error: ${res.status} ${res.statusText}`);
  }
  const listData = await res.json();

  return (
    <main>
      <ShoppingList data={listData} />
    </main>
  );
}
