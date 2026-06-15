import { DEFAULT_ERROR_MESSAGE, UNAUTHORISED } from "./utils";
import { PASSWORD_ROUTE } from "../../types/constants";

type FetchOptions =
  | { method: 'GET' }
  | { method: 'POST' | 'PATCH'; body: Record<string, any> };

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; //

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

export default async function appFetch<T = any>(
  path: string,
  options: FetchOptions = { method: 'GET' },
  customCookieHeader?: string
): Promise<T> {
  const isPostOrPatch = options.method === "POST" || options.method === "PATCH";

  const fetchConfig: RequestInit = {
    method: options.method,
    credentials: 'include',
    headers: {
      ...(customCookieHeader && { 'Cookie': customCookieHeader }),
      ...(isPostOrPatch && { 'Content-Type': 'application/json' })
    },
    ...(isPostOrPatch && { body: JSON.stringify(options.body) })
  };

  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/${path}`, fetchConfig);

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.assign(PASSWORD_ROUTE);
        return new Promise(() => { });
      }
      throw new Error(UNAUTHORISED);
    }

    const body = await res.json();

    if (!res.ok) {
      console.error(`Flask API Error: ${res.status} ${res.statusText}`);

      if (res.status === 500) {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }
      throw new Error(body.message || DEFAULT_ERROR_MESSAGE);
    }

    return body as T;
  } catch (error: any) {
    throw new Error(error.message || DEFAULT_ERROR_MESSAGE);
  }
}