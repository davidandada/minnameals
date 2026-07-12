export type ListItemApi = {
  archived_at: string | null;
  created_at: string;
  id: number;
  is_archived: boolean;
  is_checked: boolean;
  item: string;
  position: string;
  updated_at: string;
  category_id?: number | null;
  category?: {
    id: number;
    name: string;
  } | null;
}

export type NewItem = {
  item: string;
}