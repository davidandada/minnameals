"use server";

import PasswordForm from "../../components/PasswordForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function submitPasswordAction(password: string) {
  if (password === "1234") {
    const cookieStore = await cookies();

    cookieStore.set("app_password", "1234", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    redirect("/");
  }

  return false;
}

export default async function Password() {
  return (
    <main>
      <PasswordForm />
    </main>
  );
}
