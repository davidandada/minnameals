"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { archiveAllListItems } from "@/api/listItems";
import { useNotification } from "@/components/NotificationProvider";
import { ListItemApi } from "@/types/api/listItems";

export type SortMode = "position" | "category";

type ListContextType = {
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean | ((prev: boolean) => boolean)) => void;
  archiveAllMutation: UseMutationResult<ListItemApi[], Error, void, { previousItems?: ListItemApi[] }>;
  isSortModeReady: boolean;
};

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: React.ReactNode }) {
  const [sortMode, setSortModeState] = useState<SortMode>("position");
  const [showCompleted, setShowCompletedState] = useState<boolean>(true);
  const [isSortModeReady, setIsSortModeReady] = useState(false);
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedSort = localStorage.getItem("list_sort_mode") as SortMode | null;
    if (storedSort) setSortModeState(storedSort);

    const storedShowCompleted = localStorage.getItem("list_show_completed");
    if (storedShowCompleted !== null) {
      setShowCompletedState(storedShowCompleted === "true");
    }

    setIsSortModeReady(true);
  }, []);

  const setSortMode = (mode: SortMode) => {
    setSortModeState(mode);
    localStorage.setItem("list_sort_mode", mode);
  };

  const setShowCompleted = (action: boolean | ((prev: boolean) => boolean)) => {
    setShowCompletedState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      localStorage.setItem("list_show_completed", String(next));
      return next;
    });
  };

  const archiveAllMutation = useMutation({
    mutationFn: archiveAllListItems,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previousItems = queryClient.getQueryData<ListItemApi[]>(["items"]);
      queryClient.setQueryData<ListItemApi[]>(["items"], []);
      return { previousItems };
    },
    onError: (err, _, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      showError(err.message || "Error clearing list");
    },
    onSuccess: () => {
      showSuccess("All items cleared!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  return (
    <ListContext.Provider
      value={{
        sortMode,
        setSortMode,
        showCompleted,
        setShowCompleted,
        archiveAllMutation,
        isSortModeReady,
      }}
    >
      {children}
    </ListContext.Provider>
  );
}

export function useListContext() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useListContext must be used within a ListProvider");
  }
  return context;
}
