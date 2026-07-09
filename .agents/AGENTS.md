# Local Development & Coding Conventions

Welcome to the Baeda workspace! Below is the guide for running the development server and code conventions to follow.

---

## 1. Local Development Server

The application is a hybrid **Next.js frontend** and **Flask Python backend** compiled together via Vercel.

* **Dev Command**: Run `pnpm run dev` at the root.
* **Under the hood**: 
  - This executes `bash scripts/dev.sh`.
  - It automatically activates the Python virtual environment (`.venv`) in the `/api` directory.
  - It starts the Vercel CLI locally (`vercel dev -L`) to serve both frontend page requests and backend API requests under a single local origin.

---

## 2. Directory Structure

* **`/src/app`**: Next.js App Router directories for pages, layout, and styling.
* **`/src/components`**: Reusable React/MUI components (e.g. `ItemRow`, `AddItem`).
* **`/src/api`**: Next.js Server Actions and fetch helper client layers.
* **`/api`**: Python backend routes written in Flask (`api/index.py`), connecting to the Supabase database client.

---

## 3. Frontend Code Conventions

* **State Management**: Uses `@tanstack/react-query` (`useQuery`, `useMutation`) for all server state caches.
* **UI & Styling**: Material UI (MUI) components mixed with Tailwind CSS for layouts and spacing utility classes.
* **Alert Notifications**: Centralized alerts managed globally by the notification manager (`NotificationProvider` context and `useNotification` hook) at the root layout level, rather than rendering local `<Snackbar>` components.
* **API Endpoints**: Always query against `/v1/item` and `/v1/category` endpoints.
* **Error Handling**: Use the client fetch wrapper `src/api/fetch.ts` to execute requests. It automatically handles session redirects (401) and intercepts raw HTML/text exceptions safely.

---

## 4. Backend Code Conventions

* **Framework**: Built with Flask serverless route handlers in `api/index.py`.
* **Database Connection**: Interfaces with Supabase using the standard `supabase-py` client.
* **Supabase Schema**: Always interact with the `mealplan` schema explicitly by chaining the `.schema()` selector:
  ```python
  supabase.schema("mealplan").table("item")
  ```
* **Authentication**: Protect routes by checking session validity using the `is_user_authenticated()` helper function before executing actions.
* **Response Handling**: Use standardized dictionary responses imported from `helpers.messages` (e.g. `UNAUTHENTICATED`, `ITEM_REQUIRED`) and return them alongside correct HTTP status codes (400, 401, etc.).
* **Timestamp Conventions**: Standardize datetime recordings to UTC ISO-8601 formatting:
  ```python
  datetime.now(timezone.utc).isoformat()
  ```

---

## 5. Key Dependencies & Libraries

* **Component Library**: Material UI (`@mui/material`) is used for core UI components, themes, and interactive controls.
* **Styling Framework**: Tailwind CSS (`tailwindcss`) is used alongside MUI to handle layouts, margins, and component alignments.
* **State Management**: `@tanstack/react-query` is utilized for backend query fetching, caching, and mutation state transitions.
* **Drag and Drop**: `@dnd-kit/react` and `@dnd-kit/helpers` handle list sorting and reordering events.
* **List Indexing**: `fractional-indexing` calculates relative position keys of items to prevent full-list indexing operations in Supabase.
