"use client";

import React, { createContext, useContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import Slide from "@mui/material/Slide";

type NotificationType = "success" | "error" | "info" | "warning";

type NotificationContextType = {
  showNotification: (message: string, type?: NotificationType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("success");

  const showNotification = (msg: string, t: NotificationType = "success") => {
    setMessage(msg);
    setType(t);
    setOpen(true);
  };

  const showSuccess = (msg: string) => showNotification(msg, "success");
  const showError = (msg: string) => showNotification(msg, "error");

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        slots={{ transition: Slide }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleClose} severity={type} variant="filled" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
