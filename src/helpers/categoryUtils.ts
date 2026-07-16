import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/categories";
import { CategoryApi } from "@/types/api/category";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function getCategoryById(categories: CategoryApi[], categoryId: number | null | undefined) {
  if (!categoryId) return undefined;
  return categories.find((category) => category.id === categoryId);
}

export function useCategory(categoryId: number | null | undefined) {
  const { data: categories = [] } = useCategories();
  return getCategoryById(categories, categoryId);
}
