import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ShoppingList from "@/components/ShoppingList";
import { getListItems } from "@/api/listItems";

export const dynamic = "force-dynamic";

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["items"],
    queryFn: getListItems,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ShoppingList />
    </HydrationBoundary>
  );
}
