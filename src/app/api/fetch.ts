'use server';

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { DEFAULT_ERROR_MESSAGE } from "./utils";
import { PASSWORD_ROUTE } from "../../types/constants";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type FetchOptions =
  | { method: 'GET' }
  | { method: 'POST' | 'PATCH'; body: Record<string, any> };

export default async function appFetch(path: string, options: FetchOptions = { method: 'GET' }) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieHeader = cookieStore.toString();

  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const isLocal = process.env.NODE_ENV === "development" || host?.includes("localhost") || host?.includes("[::1]");
  const baseUrl = isLocal ? "http://localhost:3000" : `https://${host}`;

  const isPostOrPatch = (options.method === "POST" || options.method === "PATCH")

  const fetchConfig: RequestInit = {
    method: options.method,
    headers: {
      Cookie: cookieHeader,
      ...(isPostOrPatch && { 'Content-Type': 'application/json' })
    },
    ...(isPostOrPatch && { body: JSON.stringify(options.body) })
  };

  return await Promise.try(async () => {
    const res = await fetch(`${baseUrl}/api/${path}`, fetchConfig)
    const body = await res.json();
    console.log(res)
    if (!res.ok) {
      console.error(`Flask API Error: ${res.status} ${res.statusText}`);
      if (res.status === 401) {
        return redirect(PASSWORD_ROUTE)
      }
      if (res.status === 500) {
        throw new Error(DEFAULT_ERROR_MESSAGE)
      }
      throw new Error(body.message || DEFAULT_ERROR_MESSAGE)
    }
    return body;
  }).catch(error => {
    if (isRedirectError(error)) {
      throw error
    }
    throw new Error(error.message)
  }).then(body => body);
}