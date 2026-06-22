"use server";

import { cookies } from "next/headers";
import appFetch from "@/api/fetch";

export async function submitPasswordAction(password: string) {
  const cookieStore = await cookies();

  cookieStore.set("app_password", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  const cookieHeader = cookieStore.toString();

  return checkAuthentication(cookieHeader);
}

export async function checkAuthentication(cookieHeader?: string) {
  try {
    const response = await appFetch("v1/auth", { method: 'GET' }, cookieHeader);
    return response?.success || false;
  } catch (error) {
    return false;
  }
}