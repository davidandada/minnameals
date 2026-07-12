"use client";

import React, { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import brandColours from "@/styles/colours";
import CategoryChip from "@/components/CategoryChip";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (emoji: string, color: string, name: string) => void;
  isPending?: boolean;
};

export default function CreateCategoryModal({ open, onClose, onSubmit, isPending }: Props) {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🍎");
  const [selectedColor, setSelectedColor] = useState<string>("baedaOrange");
  const [categoryInputText, setCategoryInputText] = useState<string>("");

  const handleClose = () => {
    setCategoryInputText("");
    setSelectedEmoji("🍎");
    setSelectedColor("baedaOrange");
    onClose();
  };

  const handleSubmit = () => {
    if (!categoryInputText.trim()) return;
    onSubmit(selectedEmoji, selectedColor, categoryInputText);
    setCategoryInputText("");
    setSelectedEmoji("🍎");
    setSelectedColor("baedaOrange");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onClick={(e) => e.stopPropagation()}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "var(--mui-palette-baedaGrey-800)",
            backgroundImage: "none",
            border: "1px solid var(--mui-palette-baedaGrey-700)",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "360px",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" color="baedaOrange.main" sx={{ fontWeight: "bold" }}>
          Create category
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <TextField
          autoFocus
          color="baedaOrange"
          fullWidth
          label="Name"
          placeholder="Name"
          margin="dense"
          onChange={(e) => setCategoryInputText(e.target.value)}
          value={categoryInputText}
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              sx: {
                typography: "body2",
              },
            },
          }}
        />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: "var(--mui-palette-baedaGrey-100)" }}>
          Select Color
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {Object.entries(brandColours).map(([colorName, colorScale]) => {
            const hexValue = colorScale[500];
            return (
              <IconButton
                key={colorName}
                onClick={() => setSelectedColor(colorName)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: hexValue,
                  border: selectedColor === colorName ? "2px solid #ffffff" : "2px solid transparent",
                  boxShadow: selectedColor === colorName ? "0 0 4px rgba(255,255,255,0.6)" : "none",
                  "&:hover": {
                    backgroundColor: hexValue,
                    opacity: 0.9,
                  },
                }}
              />
            );
          })}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--mui-palette-baedaGrey-100)" }}>
          Select Emoji
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={(emojiData) => setSelectedEmoji(emojiData.emoji)}
            width="100%"
            height={300}
          />
        </Box>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="var(--mui-palette-baedaGrey-300)">
            Preview:
          </Typography>
          <CategoryChip
            emoji={selectedEmoji}
            name={categoryInputText || "New Category"}
            colorName={selectedColor}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit" size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="baedaOrange"
          size="small"
          disabled={!categoryInputText.trim() || isPending}
          sx={{ textTransform: "none", fontWeight: "bold" }}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
