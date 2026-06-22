import { ListItemApi } from "@/types/api/listItems";

export default function useSortShoppingListItems(items: ListItemApi[]) {
  if (!items || !items.length) return [[], []];
  const [checked, unchecked] = separateByChecked(items);
  const sortedCheckedItems = [...checked].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const sortedUncheckedItems = [...unchecked].sort((a, b) =>
    a.position.localeCompare(b.position, undefined, { numeric: true }),
  );

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
