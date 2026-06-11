"use client";

import React, { useState } from "react";
import { Button, Input, Snackbar } from "@mui/material";
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
          console.log(item);
          setShowSuccessSnack(item.item);
        })
        .catch((error) => {
          console.log({ error });
          setShowErrorSnack(error.message || "Error adding itemm");
        });
    }
  };

  return (
    <>
      <Button
        className="w-full normal-case flex gap-2 justify-start text-baedaOrange-500"
        size="large"
        onClick={toggleInputShowing}
      >
        <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaOrange-500" />
        {inputShowing ? (
          <Input autoFocus fullWidth color="baedaOrange" onKeyUp={handleSubmit} onBlur={toggleInputShowing} />
        ) : (
          "Add item"
        )}
      </Button>
      <Snackbar
        autoHideDuration={6000}
        message={`${showSuccessSnack} added successfully`}
        onClose={() => setShowSuccessSnack(false)}
        open={!!showSuccessSnack}
        slots={{ transition: Slide }}
      />
      <Snackbar
        autoHideDuration={6000}
        message={showErrorSnack}
        onClose={() => setShowErrorSnack(false)}
        open={!!showErrorSnack}
        slots={{ transition: Slide }}
      />
    </>
  );
}
