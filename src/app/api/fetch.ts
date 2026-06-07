import { cookies } from "next/headers";

type FetchOptions = {
  method?: 'GET' | 'PATCH',
} | ({
  method: 'POST',
  data: Record<string, any>
})

export default async function appFetch(path: string, options?: FetchOptions) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const baseUrl =
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${process.env.VERCEL_URL}`;

  const fetchConfig: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      Cookie: cookieHeader,
      ...(options?.method === 'POST' && { 'Content-Type': 'application/json' })
    },
    ...(options?.method === 'POST' && { body: JSON.stringify(options.data) })
  }

  return fetch(`${baseUrl}/api/${path}`, fetchConfig);
}