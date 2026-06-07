export const dynamic = "force-dynamic";

import { Typography } from "@mui/material";
import ShoppingList from "../components/minnameals/ShoppingList";

export default async function Home() {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/todos`);
  if (!res.ok) {
    throw new Error("Failed to fetch list");
  }
  const listData = await res.json();

  return (
    <main>
      <Typography variant="h6" component="h2" className="text-center mb-2">
        Shopping list
      </Typography>
      <ShoppingList data={listData} />
    </main>
  );
}
