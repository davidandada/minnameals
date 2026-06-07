import { cookies, headers } from "next/headers";
import { Typography } from "@mui/material";
import ShoppingList from "../components/minnameals/ShoppingList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const headersList = await headers();

  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : `https://${process.env.VERCEL_URL}`;
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${baseUrl}/api/todos`, {
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) {
    console.error(`Flask API Error: ${res.status} ${res.statusText}`);
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
