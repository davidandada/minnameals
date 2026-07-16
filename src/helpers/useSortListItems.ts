import { useCategories, getCategoryById } from "@/helpers/categoryUtils";
import { ListItemApi } from "@/types/api/listItems";

export default function useSortShoppingListItems(
  items: ListItemApi[],
  sortMode: "position" | "category" = "position",
) {
  const { data: categories = [] } = useCategories();

  if (!items || !items.length) return [[], []];
  const [checked, unchecked] = separateByChecked(items);
  const sortedCheckedItems = [...checked].sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const sortedUncheckedItems = [...unchecked];
  if (sortMode === "category") {
    sortedUncheckedItems.sort((a, b) => {
      const catA = getCategoryById(categories, a.category_id);
      const catB = getCategoryById(categories, b.category_id);

      if (catA && catB) {
        const nameA = catA.name.toLowerCase();
        const nameB = catB.name.toLowerCase();
        if (nameA !== nameB) {
          return nameA.localeCompare(nameB);
        }
        return a.position.localeCompare(b.position);
      }
      if (catA) return -1;
      if (catB) return 1;

      return a.position.localeCompare(b.position);
    });
  } else {
    sortedUncheckedItems.sort((a, b) => a.position.localeCompare(b.position));
  }

  return [sortedCheckedItems, sortedUncheckedItems];
}

const separateByChecked = (items: ListItemApi[]) => {
  return items.reduce<[ListItemApi[], ListItemApi[]]>(
    (acc, item) => {
      if (item.is_checked) {
        acc[0].push(item);
      } else {
        acc[1].push(item);
      }
      return acc;
    },
    [[], []],
  );
};
