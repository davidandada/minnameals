export type ListItemApi = {
  archived_at: string | null;
  created_at: string;
  id: number;
  is_archived: boolean;
  is_checked: boolean;
  item: string;
  position: string;
  updated_at: string;
}

export type NewItem = {
  item: string;
}