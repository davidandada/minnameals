export type ListItem = {
  id: number;
  item: string;
  is_checked: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}