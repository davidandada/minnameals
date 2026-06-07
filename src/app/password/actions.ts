"use server";

import { cookies } from "next/headers";
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
    const errorHtml = await res.text();
    console.error(`[Flask Error] ${res.status} ${res.statusText}`);
    console.error(`[Raw Response Body]:\n`, errorHtml);
    return false;
  }

  const data = await res.json();
  return data.success;
}