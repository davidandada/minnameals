export type CategoryApi = {
  id: number;
  name: string;
  colour: string;
  emoji: string;
  is_archived: boolean;
  position: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};