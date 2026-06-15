"use server";

import { cookies } from "next/headers";
import appFetch from "../fetch"; // Double check your import path

export async function submitPasswordAction(password: string) {
  const cookieStore = await cookies();

  // 1. Set the cookie on the response so the browser saves it
  cookieStore.set("app_password", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // 2. Grab the updated cookie string (which now includes app_password)
  const cookieHeader = cookieStore.toString();

  // 3. Pass the cookie explicitly to your auth checker
  return checkAuthentication(cookieHeader);
}

// 4. Accept the optional cookie parameter (This allows proxy.ts to use it too!)
export async function checkAuthentication(cookieHeader?: string) {
  try {
    // 5. Forward the cookie down to your isomorphic fetch utility
    const response = await appFetch("v1/auth", { method: 'GET' }, cookieHeader);
    return response?.success || false;
  } catch (error) {
    // Catch the 401 Unauthorized or 500 errors thrown by appFetch
    return false;
  }
}