import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const protectedRoutePrefixes = ["/dashboard", "/leads", "/concepts", "/outreach"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const cookieHeader = req.headers.get("cookie") ?? "";
  const initialCookies = parseCookieHeader(cookieHeader);
  let cookies: Array<{ name: string; value: string }> = initialCookies.map(
    (c) => ({
      name: c.name,
      value: c.value ?? "",
    }),
  );

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: async () => cookies,
        setAll: async (setCookies) => {
          // Persist changes in-memory (for any further reads) and in the response.
          cookies = [
            ...cookies.filter((c) => !setCookies.some((sc) => sc.name === c.name)),
          ];

          for (const sc of setCookies) {
            res.headers.append(
              "set-cookie",
              serializeCookieHeader(sc.name, sc.value, sc.options),
            );

            // Keep local state in sync for the rest of the middleware execution.
            cookies.push({ name: sc.name, value: sc.value });
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isProtectedRoute = protectedRoutePrefixes.some((p) => pathname.startsWith(p));
  const isLoginRoute = pathname === "/login";

  if (isProtectedRoute && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/concepts/:path*",
    "/outreach/:path*",
    "/login",
  ],
};

