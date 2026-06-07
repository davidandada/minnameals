import ShoppingList from "../components/minnameals/ShoppingList";

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/todos`);
  if (!res.ok) {
    throw new Error("Failed to fetch list");
  }
  const listData = await res.json();
  console.log(listData);
  return (
    <main>
      <ShoppingList data={listData} />
    </main>
  );
}
