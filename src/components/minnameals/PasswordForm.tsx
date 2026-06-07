"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton, TextField } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { submitPasswordAction } from "../../app/password/page";

export default function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError(false);

    const success = await submitPasswordAction(password);
    if (!success) {
      setError(true);
      setIsSubmitting(false);
    } else router.push("/");
  };

  return (
    <div className="mx-auto self-center flex gap-2">
      <TextField
        error={error}
        helperText={error ? "Incorrect password" : ""}
        id="password"
        label="Enter app password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        variant="standard"
        className="text-neutral-800 dark:text-neutral-200"
      />
      <div className="flex items-end">
        <IconButton aria-label="submit" onClick={handleLogin} disabled={isSubmitting}>
          <LoginIcon />
        </IconButton>
      </div>
    </div>
  );
}
