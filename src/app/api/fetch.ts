import { cookies, headers } from "next/headers";

type FetchOptions =
  | { method?: 'GET' | 'PATCH' }
  | { method: 'POST'; data: Record<string, any> };

export default async function appFetch(path: string, options?: FetchOptions) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieHeader = cookieStore.toString();

  const host = headersList.get("x-forwarded-host") || headersList.get("host");

  const isLocal = process.env.NODE_ENV === "development" || host?.includes("localhost") || host?.includes("[::1]");

  const baseUrl = isLocal ? "http://localhost:3000" : `https://${host}`;

  const fetchConfig: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      Cookie: cookieHeader,
      ...(options?.method === 'POST' && { 'Content-Type': 'application/json' })
    },
    ...(options?.method === 'POST' && { body: JSON.stringify(options.data) })
  };

  return fetch(`${baseUrl}/api/${path}`, fetchConfig);
}