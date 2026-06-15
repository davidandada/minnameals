"use client";

import React, { useState } from "react";
import { Alert, Button, Snackbar, TextField } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { createListItem } from "../../app/api/listItems";
import Slide from "@mui/material/Slide";

export default function AddItem() {
  const [inputShowing, setInputShowing] = useState<boolean>(false);
  const [showSuccessSnack, setShowSuccessSnack] = useState<boolean | string>(false);
  const [showErrorSnack, setShowErrorSnack] = useState<boolean | string>(false);

  const toggleInputShowing = () => {
    setInputShowing((prev) => !prev);
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const inputValue = e.currentTarget.value;
      if (!inputValue) return;
      Promise.try(async () => {
        return await createListItem(inputValue);
      })
        .then((item) => {
          setShowSuccessSnack(item.item);
        })
        .catch((error) => {
          setShowErrorSnack(error.message || "Error adding itemm");
        });
    }
  };

  return (
    <>
      <Button
        className="w-full normal-case flex gap-2 justify-start text-baedaOrange-500"
        disableRipple
        onClick={toggleInputShowing}
        size="large"
      >
        <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaOrange-500" />
        {inputShowing ? (
          <TextField
            autoFocus
            color="baedaOrange"
            fullWidth
            onBlur={toggleInputShowing}
            size="small"
            slotProps={{ htmlInput: { onKeyUp: handleSubmit } }}
            variant="standard"
          />
        ) : (
          "Add item"
        )}
      </Button>
      <Snackbar
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnack(false)}
        open={!!showSuccessSnack}
        slots={{ transition: Slide }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {showSuccessSnack} added!
        </Alert>
      </Snackbar>
      <Snackbar
        autoHideDuration={3000}
        onClose={() => setShowErrorSnack(false)}
        open={!!showErrorSnack}
        slots={{ transition: Slide }}
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          {showErrorSnack}
        </Alert>
      </Snackbar>
    </>
  );
}
