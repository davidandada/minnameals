import { Metadata } from "next";
import Head from "next/head";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import QueryProvider from "./QueryProvider";
import Header from "../components/layouts/Header";
import PageLayout from "../components/layouts/PageLayout";
import theme from "../styles/theme";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Baeda",
  description: "All things David and Ada",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <QueryProvider>
              <CssBaseline />
              <Header />
              <PageLayout>{children}</PageLayout>
            </QueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
