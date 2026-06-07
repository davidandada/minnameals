"use server";

import PasswordForm from "../../components/minnameals/PasswordForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import appFetch from "../api/fetch";

export async function submitPasswordAction(password: string) {
  const cookieStore = await cookies();

  cookieStore.set("app_password", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  const res = await appFetch("v1/auth");
  if (!res.ok) {
    console.error(`Flask API Error: ${res.status} ${res.statusText}`);
  }
  const isAuthenticated = (await res.json()).success;
  return isAuthenticated;
}

export default async function Password() {
  // const res = await appFetch("v1/auth");
  // if (res.ok) {
  //   const isAuthenticated = (await res.json()).success;
  //   if (isAuthenticated) {
  //     redirect("/");
  //   }
  // }

  return (
    <section className="min-h-[inherit] w-full flex items-center justify-center">
      <PasswordForm />
    </section>
  );
}
