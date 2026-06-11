"use server";

import { cookies } from "next/headers";
import appFetch from "../fetch";

export async function submitPasswordAction(password: string) {
  const cookieStore = await cookies();

  cookieStore.set("app_password", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return checkAuthentication();
}

export async function checkAuthentication() {
  const response = await appFetch("v1/auth");
  return response.success;
}
