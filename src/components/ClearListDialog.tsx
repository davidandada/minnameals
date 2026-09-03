"use client";

import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearing?: boolean;
};

export default function ClearListDialog({
  open,
  onClose,
  onConfirm,
  isClearing = false,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="clear-dialog-title"
      aria-describedby="clear-dialog-description"
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "var(--mui-palette-baedaGrey-800)",
            backgroundImage: "none",
            border: "1px solid var(--mui-palette-baedaGrey-700)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "380px",
            p: 0.5,
          },
        },
      }}
    >
      <DialogTitle
        id="clear-dialog-title"
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <WarningAmberRoundedIcon sx={{ color: "var(--mui-palette-baedaOrange-500)", fontSize: 26 }} />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: "var(--mui-palette-baedaGrey-50)" }}>
          Clear shopping list?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 1, px: 3 }}>
        <DialogContentText
          id="clear-dialog-description"
          sx={{
            color: "var(--mui-palette-baedaGrey-200)",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          This will archive all items currently on your shopping list. This action cannot be undone.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          color="baedaRed"
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="baedaRed"
          variant="contained"
          size="small"
          disabled={isClearing}
          autoFocus
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 2,
          }}
        >
          Clear List
        </Button>
      </DialogActions>
    </Dialog>
  );
}
