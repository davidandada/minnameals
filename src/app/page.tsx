import ShoppingList from "../components/minnameals/ShoppingList";
import { getListItems } from "./api/listItems";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getListItems();

  return (
    <main>
      <ShoppingList data={data} />
    </main>
  );
}
