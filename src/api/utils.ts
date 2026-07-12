import { cookies } from "next/headers";

export const DEFAULT_ERROR_MESSAGE = "Something went wrong"
export const UNAUTHORISED = "UNAUTHORISED"

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}