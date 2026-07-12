import { ListItemApi } from "@/types/api/listItems";
import { splitCategoryName } from "@/helpers/categoryUtils";

export default function useSortShoppingListItems(
  items: ListItemApi[],
  sortMode: "position" | "category" = "position",
) {
  if (!items || !items.length) return [[], []];
  const [checked, unchecked] = separateByChecked(items);
  const sortedCheckedItems = [...checked].sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const sortedUncheckedItems = [...unchecked];
  if (sortMode === "category") {
    sortedUncheckedItems.sort((a, b) => {
      if (a.category && b.category) {
        const catA = splitCategoryName(a.category.name).name.toLowerCase();
        const catB = splitCategoryName(b.category.name).name.toLowerCase();
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return a.position.localeCompare(b.position);
      }
      if (a.category) return -1;
      if (b.category) return 1;

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
