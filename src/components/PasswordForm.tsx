"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, IconButton, TextField } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { submitPasswordAction } from "@/api/password";
import brandColours from "@/styles/colours";

export default function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    const success = await submitPasswordAction(password);
    if (!success) {
      setError(true);
      setIsSubmitting(false);
    } else router.push("/");
  };

  return (
    <Box component="form" onSubmit={handleLogin} className="mx-auto self-center flex gap-2">
      <TextField
        className="text-neutral-800 dark:text-neutral-200"
        color="baedaOrange"
        error={error}
        helperText={error ? "Incorrect password" : ""}
        id="password"
        label="Enter app password"
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          "& .MuiInput-underline": {
            "&:before": {
              borderBottomColor: brandColours.baedaOrange[500],
            },
            "&:hover:not(.Mui-disabled, .Mui-error):before": {
              borderBottomColor: brandColours.baedaOrange[500],
            },

            "&:after": {
              borderBottomColor: brandColours.baedaOrange[500],
            },
          },
        }}
        value={password}
        variant="standard"
      />
      <div className="flex items-end">
        <IconButton aria-label="submit" color="baedaOrange" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress color="baedaOrange" size={24} /> : <LoginIcon />}
        </IconButton>
      </div>
    </Box>
  );
}
